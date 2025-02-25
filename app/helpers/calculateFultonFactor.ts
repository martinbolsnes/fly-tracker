export const calculateFultonFactor = (
    length: number,
    weight: number
  ): number => {
    return (weight / Math.pow(length, 3)) * 100;
  };