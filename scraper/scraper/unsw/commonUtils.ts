import { CourseData } from '../../../app/src/state/Course';
import { DeliveryType, StreamData } from '../../../app/src/state/Stream';

export function removeDuplicateStreams (course: CourseData) {
  const mapping = new Map<string, StreamData[]>();
  for (let stream of course.streams) {
    const times = stream.times !== null ? stream.times.map(t => t.time) : null;
    const key = stream.component + `[${times}]`;
    const currentGroup = mapping.get(key) || [];
    const newGroup = currentGroup.concat(stream);
    mapping.set(key, newGroup);
  }

  // For each set of streams with identical component and times, remove all but the emptiest stream
  for (const streamGroup of Array.from(mapping.values())) {
    const emptiest = emptiestStream(streamGroup);
    emptiest.delivery = mergeDeliveryType(streamGroup);
    for (let stream of streamGroup) {
      if (stream !== emptiest) {
        const index = course.streams.indexOf(stream);
        course.streams.splice(index, 1);
      }
    }
  }
}

function emptiestStream (streams: StreamData[]) {
  let bestStream = null;
  let bestRatio = Infinity;
  for (let stream of streams) {
    const ratio = stream.enrols[0] / stream.enrols[1];
    if (ratio < bestRatio) {
      bestRatio = ratio;
      bestStream = stream;
    }
  }

  return bestStream!;
}

export function mergeDeliveryType (streams: StreamData[]): DeliveryType | undefined {
  // Merges delivery types of multiple streams
  let delivery: DeliveryType | undefined;
  for (const stream of streams) {
    if (stream.delivery !== undefined) {
      if (delivery === undefined) {
        delivery = stream.delivery;
      } else if (stream.delivery !== delivery) {
        delivery = DeliveryType.either;
        break;
      }
    }
  }
  return delivery;
}
