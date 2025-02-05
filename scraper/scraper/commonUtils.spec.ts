import { getInPersonTimes, mergeDeliveryType } from './commonUtils';
import { StreamData, DeliveryType } from '../../app/src/state/Stream';

const baseStream: StreamData = { component: '', times: [] };

describe('mergeDeliveryType', () => {
  it.each`
    delivery
    ${DeliveryType.online}
    ${DeliveryType.person}
    ${DeliveryType.mixed}
  `('preserves type for single stream', ({ delivery }) => {
    const streams: StreamData[] = [
      { ...baseStream, delivery },
    ];
    expect(mergeDeliveryType(streams)).toBe(delivery);
  });

  it('returns "either" when both online and in person options are present', () => {
    const streams: StreamData[] = [
      { ...baseStream, delivery: DeliveryType.online },
      { ...baseStream, delivery: DeliveryType.person },
    ];
    expect(mergeDeliveryType(streams)).toBe(DeliveryType.either);
  });

  it('returns "either" when both online and mixed options are present', () => {
    const streams: StreamData[] = [
      { ...baseStream, delivery: DeliveryType.online },
      { ...baseStream, delivery: DeliveryType.mixed },
      { ...baseStream, delivery: DeliveryType.mixed },
    ];
    expect(mergeDeliveryType(streams)).toBe(DeliveryType.either);
  });

  it('returns "either" when both person and mixed options are present', () => {
    const streams: StreamData[] = [
      { ...baseStream, delivery: DeliveryType.person },
      { ...baseStream, delivery: DeliveryType.mixed },
      { ...baseStream, delivery: DeliveryType.person },
    ];
    expect(mergeDeliveryType(streams)).toBe(DeliveryType.either);
  });

  it('mergeDeliveryType([]) === undefined', () => {
    expect(mergeDeliveryType([])).toBe(undefined);
  });

  it('gives undefined when no streams have delivery types', () => {
    const streams: StreamData[] = [
      { ...baseStream }, { ...baseStream }, { ...baseStream }, { ...baseStream },
    ];
    expect(mergeDeliveryType(streams)).toBe(undefined);
  });
});


describe('getInPersonTimes', () => {
  it('returns first in-person time set', () => {
    const time = 'M10';
    const streams: StreamData[] = [
      {
        ...baseStream,
        delivery: DeliveryType.mixed,
        enrols: [10, 20],
        times: [{ time, location: 'Somewhere' }],
      },
      {
        ...baseStream,
        delivery: DeliveryType.person,
        enrols: [10, 20],
        times: [{ time, location: 'Elsewhere' }],
      },
      {
        ...baseStream,
        delivery: DeliveryType.person,
        enrols: [10, 20],
        times: [{ time, location: 'Another place' }],
      },
    ];
    const result = getInPersonTimes(streams);
    expect(result).toEqual([{ time, location: 'Elsewhere' }]);
  });

  it('handles group with no in-person classes', () => {
    const time = 'M10';
    const streams: StreamData[] = [
      {
        ...baseStream,
        delivery: DeliveryType.mixed,
        enrols: [10, 20],
        times: [{ time, location: 'Somewhere' }],
      },
    ];
    const result = getInPersonTimes(streams);
    expect(result).toBe(null);
  });
});
