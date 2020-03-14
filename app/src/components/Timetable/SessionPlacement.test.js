import { CLASH_OFFSET_X, CLASH_OFFSET_Y, TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_DAYS, TIMETABLE_BORDER_WIDTH, TIMETABLE_CELL_HEIGHT } from './timetableUtil';
import SessionPlacement from './SessionPlacement';

const session = {
  start: 10,
  end: 11,
  day: 'W',
};
const startHour = 9;
const dimensions = {
  width: 1000,
  height: 1000,
};


describe('SessionPlacement', () => {
  test('can initialise instance with expected base position', () => {
    const p = new SessionPlacement(session);
    expect(p.session).toBe(session);

    const basePlacement = p.basePlacement(dimensions, startHour);
    const cellWidth = (1000 - TIMETABLE_FIRST_CELL_WIDTH) / TIMETABLE_DAYS;
    const expectedX = 61 + cellWidth * 2;
    const expectedY = 51 + 50;
    expect(basePlacement.x).toBe(expectedX);
    expect(basePlacement.y).toBe(expectedY);
    expect(basePlacement.width).toBe(cellWidth - 1);
    expect(basePlacement.height).toBe(49);
  });

  test('getters return expected initial values', () => {
    const p = new SessionPlacement(session);
    expect(p.isSnapped).toBe(true);
    expect(p.isDragging).toBe(false);
    expect(p.isRaised).toBe(false);
  });

  test('begin drag', () => {
    const p = new SessionPlacement(session);
    p.clashDepth = 2;
    p.drag();
    expect(p.isSnapped).toBe(false);
    expect(p.isDragging).toBe(true);
    expect(p.isRaised).toBe(false);
    expect(p._offset).toEqual(
      { x: CLASH_OFFSET_X * 2, y: CLASH_OFFSET_Y * 2 }
    );
  });

  test('move', () => {
    const p = new SessionPlacement(session);

    p.move({ x: 10, y: -10 });
    p.move({ x: 5, y: 10 });

    expect(p._offset).toEqual({ x: 15, y: 0 });
  });

  test('drop', () => {
    const p = new SessionPlacement(session);
    p.drag();

    p.drop({ width: 500, height: 500 }, session.start);

    expect(p._isDragging).toBe(false);
    expect(p._isSnapped).toBe(false);
    expect(p._isRaised).toBe(false);
  });

  test('snap', () => {
    const p = new SessionPlacement(session);
    p._offset = { x: 15, y: 0};
    p._isSnapped = false;
    p._isRaised = true;

    p.snap();

    expect(p._offset).toEqual({ x: 0, y: 0 });
    expect(p.isSnapped).toBe(true);
    expect(p.isRaised).toBe(false);
  });

  test('snapping when already snapped changes nothing', () => {
    const p = new SessionPlacement(session);

    p.snap();

    expect(p._offset).toEqual({ x: 0, y: 0 });
    expect(p.isSnapped).toBe(true);
    expect(p.isRaised).toBe(false);
  });

  test('raise', () => {
    const p = new SessionPlacement(session);

    p.raise();

    expect(p.isRaised).toBe(true);
  });

  test('lower', () => {
    const p = new SessionPlacement(session);
    p._isRaised = true;

    p.lower();

    expect(p.isRaised).toBe(false);
  });

  test('displace', () => {
    const p = new SessionPlacement(session);
    p.displace();
    expect(p.isSnapped).toBe(false);
    expect(p._offset).not.toEqual({ x: 0, y: 0 });
  });

  test('shouldDisplace', () => {
    const p = new SessionPlacement(session);

    p.session.stream = { full: false };
    expect(p.shouldDisplace(false)).toBe(false);
    expect(p.shouldDisplace(true)).toBe(false);

    p._isSnapped = false;
    expect(p.shouldDisplace(false)).toBe(false);
    expect(p.shouldDisplace(true)).toBe(false);

    p.session.stream.full = true;
    expect(p.shouldDisplace(false)).toBe(false);
    expect(p.shouldDisplace(true)).toBe(false);

    p._isSnapped = true;
    expect(p.shouldDisplace(false)).toBe(true);
    expect(p.shouldDisplace(true)).toBe(false);
  });

  test('touching gives expected result', () => {
    const p = new SessionPlacement(session);
    expect(p.touched).toBe(false);
    p.touch();
    expect(p.touched).toBe(true);
    p.touch();
    expect(p.touched).toBe(true);
  });

  test('position object always changes', () => {
    const p = new SessionPlacement(session);
    const pos1 = p.getPosition(dimensions, startHour);
    expect(p.getPosition(dimensions, startHour)).not.toBe(pos1);
  });

  test('position can\'t be negative after drag', () => {
    const p = new SessionPlacement(session);
    p.drag();
    p.move({ x: -1000, y: -1000 });
    const dimensions = { width: 500, height: 500 }
    p.drop(dimensions, session.start);
    const { x, y } = p.getPosition(dimensions, session.start);
    expect({ x, y }).toEqual({ x: 0, y: 0});
  });

  test('offset can\'t be too large after drag', () => {
    const p = new SessionPlacement(session);
    const dimensions = { width: 500, height: 500 }
    const cellWidth = (dimensions.width - TIMETABLE_FIRST_CELL_WIDTH) / TIMETABLE_DAYS;

    p.drag();
    p.move({ x: 1000, y: 1000 });
    p.drop(dimensions, session.start);

    const { x, y } = p.getPosition(dimensions, session.start);
    expect({ x, y }).toEqual({
      x: dimensions.width - cellWidth + TIMETABLE_BORDER_WIDTH,
      y: dimensions.height - TIMETABLE_CELL_HEIGHT + TIMETABLE_BORDER_WIDTH,
    });
  });
});
