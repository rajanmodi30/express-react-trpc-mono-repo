import {
  Box,
  Breadcrumbs,
  Container,
  Grid,
  Link,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SearchAndExport } from "../components/SearchAndExport";
import { useThemeStore } from "../store/theme";
import { defaultDateTimeFormat } from "../utils";
import { trpc } from "../utils/trpc";

export const Users = () => {
  const { defaultPerPageCount, setDefaultPerPageCount, paginationOptions } =
    useThemeStore();
  const [page, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPageCount);
  const [sortBy, setSortBy] = useState("id");
  const [sortType, setSortType] = useState("asc");
  const [search, setSearchTerm] = useState<string | undefined>(undefined);

  const { data, isLoading, isSuccess, isError, error } =
    trpc.auth.users.list.useQuery({
      perPage,
      page,
      sortBy,
      sortType,
      search,
    });
  const handleSortModelChange = (data: any) => {
    if (data.length > 0) {
      setSortBy(data[0].field);
      setSortType(data[0].sort);
    }
  };

  const handleFilterChange = (data: GridFilterModel) => {
    if (
      data.quickFilterValues !== undefined &&
      data.quickFilterValues?.length > 0
    ) {
      setSearchTerm(data.quickFilterValues.toString());
    } else {
      setSearchTerm(undefined);
    }
  };
  if (isError) {
    toast.error(error.message);
  }

  useMemo(() => {
    if (isSuccess) {
      setTotalPages(data.pagination.total);
    }
  }, [data]);
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", type: "number" },
    { field: "firstName", headerName: "First name", type: "string" },
    { field: "lastName", headerName: "Last name", type: "string" },
    { field: "email", headerName: "Email", type: "string", flex: 1 },
    {
      field: "fullName",
      headerName: "Full Name",
      type: "string",
      sortable: false,
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created On",
      type: "date",
      description: "This column has a value getter and is not sortable.",
      valueGetter: (params: GridValueGetterParams) =>
        defaultDateTimeFormat(params.row.createdAt),

      flex: 1,
    },
    {
      field: "updatedAt",
      type: "date",
      headerName: "Last Updated On",
      description: "This column has a value getter and is not sortable.",
      valueGetter: (params: GridValueGetterParams) =>
        defaultDateTimeFormat(params.row.updatedAt),
      flex: 1,
    },
  ];

  return (
    <>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ display: "flex", p: 2, flexDirection: "column" }}>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link underline="hover" color="inherit" href="/">
                    MUI
                  </Link>
                  <Link
                    underline="hover"
                    color="inherit"
                    href="/material-ui/getting-started/installation/"
                  >
                    Core
                  </Link>
                  <Typography color="text.primary">Users </Typography>
                </Breadcrumbs>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ display: "flex", flexDirection: "column" }}>
                <DataGrid
                  autoHeight
                  rows={data?.data || []}
                  sortingMode="server"
                  filterMode="server"
                  disableColumnSelector
                  disableColumnFilter
                  onSortModelChange={handleSortModelChange}
                  onFilterModelChange={handleFilterChange}
                  rowCount={totalPages}
                  disableDensitySelector
                  loading={isLoading}
                  rowsPerPageOptions={paginationOptions}
                  pagination
                  page={page}
                  pageSize={perPage}
                  paginationMode="server"
                  onPageChange={(newPage) => {
                    setCurrentPage(newPage);
                  }}
                  components={{ Toolbar: SearchAndExport }}
                  onPageSizeChange={(newPageSize) => {
                    setPerPage(newPageSize);
                    setDefaultPerPageCount(newPageSize);
                  }}
                  columns={columns}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};
