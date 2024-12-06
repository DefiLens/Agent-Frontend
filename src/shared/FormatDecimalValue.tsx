import React from 'react';

function FormatDecimalValue(value: number): JSX.Element {
  const parts = value.toFixed(18).toString().split('.');

  if (parts.length < 2) {
    return <span>{value.toFixed(4)}</span>; // Return directly if no decimal part
  }

  const decimalPart = parts[1];

  // Count the leading zeros in the decimal part
  const leadingZeros = decimalPart.match(/^0+/);
  const zeroCount = leadingZeros ? leadingZeros[0].length : 0;
  if (zeroCount >= 5) {
    // If there are 5 or more leading zeros, show them in a subscript tag
    return (
      <span>
        {parts[0]}.0<sub>{zeroCount}</sub>
        {decimalPart.slice(zeroCount, zeroCount + 2)}
      </span>
    );
  }

  // Handle cases where there are less than 5 leading zeros (if any) or none at all
  return <span>{value.toFixed(8)}</span>; // Adjust precision as necessary
}
export default FormatDecimalValue;
