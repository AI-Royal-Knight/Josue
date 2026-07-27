import { DataGrid } from "@mui/x-data-grid";
export default function Test() {
  return <DataGrid 
           rows={[]} 
           columns={[]} 
           hideFooter 
           initialState={{ pagination: { paginationModel: { pageSize: 10000 } } }} 
         />
}
