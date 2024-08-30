import React from "react";
import { useTable } from "react-table";

const PreviewDataTable = ({ data }) => {
  const columns = React.useMemo(
    () =>
      data && data.length > 0
        ? Object.keys(data[0]).map((key, index) => ({
            Header: key,
            accessor: key,
            id: key, // Ensure a unique ID for each column
          }))
        : [],
    [data]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <table {...getTableProps()} className="table-auto w-full border-collapse border border-gray-300">
      <thead>
        {headerGroups.map((headerGroup, headerGroupIndex) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={`headerGroup-${headerGroupIndex}`}>
            {headerGroup.headers.map((column, columnIndex) => (
              <th {...column.getHeaderProps()} key={`column-${columnIndex}`} className="border border-gray-300 px-4 py-2">
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, rowIndex) => {
          prepareRow(row);
          return (
            <tr key={`row-${rowIndex}`} {...row.getRowProps()} className="hover:bg-gray-100">
              {row.cells.map((cell, cellIndex) => (
                <td key={`cell-${cellIndex}`} {...cell.getCellProps()} className="border border-gray-300 px-4 py-2">
                  {cell.render("Cell")}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PreviewDataTable;
