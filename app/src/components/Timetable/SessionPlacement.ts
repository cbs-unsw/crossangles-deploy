import { Position, Dimensions } from './timetableTypes';
import { TimetablePlacement } from './Placement';
import * as tt from './timetableUtil';
import SessionPosition from './SessionPosition';
import { LinkedSession, SessionData, unlinkSession, linkSession } from '../../state/Session';
import { CourseData } from '../../state/Course';
import { getStreamId, linkStream } from '../../state/Stream';

export interface SessionPlacementData {
  offset: Position,
  isSnapped: boolean,
  isDragging: boolean,
  isRaised: boolean,
  touched: boolean,
  clashDepth: number,
  session: SessionData,
}

export class SessionPlacement extends TimetablePlacement {
  private _offset: Position;
  private _isSnapped: boolean = true;
  private _isDragging: boolean = false;
  private _isRaised: boolean = false;
  private _touched: boolean = false;
  clashDepth: number = 0;

  constructor (session: LinkedSession) {
    super(session);
    this._offset = { x: 0, y: 0 };
  }

  get data (): SessionPlacementData {
    return {
      offset: { ...this._offset },
      isSnapped: this._isSnapped,
      isDragging: this._isDragging,
      isRaised: this._isRaised,
      touched: this._touched,
      clashDepth: this.clashDepth,
      session: unlinkSession(this.session),
    }
  }

  static from (data: SessionPlacementData, course: CourseData) {
    // Get linked session
    const streamId = data.session.stream;
    const stream = course.streams.filter(s => getStreamId(course, s) === streamId)[0];
    const linkedStream = linkStream(course, stream);
    const session = linkSession(course, linkedStream, data.session);
    const placement = new SessionPlacement(session);

    // Update placement properties
    placement._offset = { ...data.offset };
    placement._isSnapped = data.isSnapped;
    placement._isDragging = data.isDragging;
    placement._isRaised = data.isRaised;
    placement._touched = data.touched;
    placement.clashDepth = data.clashDepth;

    return placement;
  }

  get isSnapped (): boolean {
    return this._isSnapped && !this._isRaised;
  }

  get isDragging (): boolean {
    return this._isDragging;
  }

  get isRaised (): boolean {
    return this._isRaised;
  }

  drag (): void {
    // Add clashOffset to current offset
    this._offset.x += this.clashDepth * tt.CLASH_OFFSET_X;
    this._offset.y += this.clashDepth * tt.CLASH_OFFSET_Y;

    this._isSnapped = false;
    this._isDragging = true;
  }

  move (delta: Position): void {
    this._offset.x += delta.x;
    this._offset.y += delta.y;
  }

  drop (): void {
    this._isDragging = false;
  }

  snap (): void {
    this._offset = { x: 0, y: 0 };
    this._isSnapped = true;
    this._isRaised = false;
  }

  raise (): void {
    this._isRaised = true;
  }

  lower (): void {
    this._isRaised = false;
  }

  // Slightly displace this session
  // (e.g. if it was in a full stream and can't be anymore)
  displace (): void {
    let dx = Math.floor(Math.random() * tt.DISPLACE_VARIATION_X * 2) - tt.DISPLACE_VARIATION_X;
    let dy = Math.floor(Math.random() * tt.DISPLACE_VARIATION_Y * 2) - tt.DISPLACE_VARIATION_Y;
    dx = (dx < 0) ? dx - tt.DISPLACE_RADIUS_X : dx + tt.DISPLACE_RADIUS_X + 1;
    dy = (dy < 0) ? dy - tt.DISPLACE_RADIUS_Y : dy + tt.DISPLACE_RADIUS_Y + 1;

    this.displaceBy(dx, dy);
  }

  private displaceBy (dx: number, dy: number): void {
    if (this._isSnapped) {
      this._isSnapped = false;
      this._offset.x += dx;
      this._offset.y += dy;
    }
  }

  shouldDisplace (includeFullClasses: boolean): boolean {
    const isFull: boolean = !!this.session.stream.full;
    return isFull && !includeFullClasses && this.isSnapped;
  }

  get touched (): boolean {
    return this._touched;
  }

  touch () {
    this._touched = true;
  }

  getPosition (timetableDimensions: Dimensions, startHour: number): Required<Position> {
    const base = this.basePlacement(timetableDimensions, startHour);
    const clash = SessionPosition.getClashOffset(this.clashDepth);
    const raised = SessionPosition.getRaisedOffset(this.isRaised);
    let x = base.x + clash.x + raised.x + this._offset.x;
    let y = base.y + clash.y + raised.y + this._offset.y;
    let z = SessionPosition.getZ(this.isSnapped, this.clashDepth);

    const maxX = timetableDimensions.width  - base.width;
    const maxY = timetableDimensions.height - base.height;

    x = Math.min(Math.max(x, 0), maxX);
    y = Math.min(Math.max(y, 0), maxY);

    return { x, y, z };
  }
}

export default SessionPlacement;
