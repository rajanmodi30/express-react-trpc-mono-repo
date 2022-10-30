import {
  Breadcrumbs,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { SearchAndExport } from "../../components/SearchAndExport";
import { useThemeStore } from "../../store/theme";
import { defaultDateTimeFormat } from "../../utils";
import { trpc } from "../../utils/trpc";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";

export const Users = () => {
  const { defaultPerPageCount, setDefaultPerPageCount, paginationOptions } =
    useThemeStore();
  const [page, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPageCount);
  const [sortBy, setSortBy] = useState("id");
  const [sortType, setSortType] = useState("asc");
  const [search, setSearchTerm] = useState<string | undefined>(undefined);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const handleClickOpen = (id: number) => {
    setToDeleteId(id);
    setOpen(true);
  };

  const handleClose = () => {
    refetch();
    setToDeleteId(null);
    setOpen(false);
  };

  const { data, isLoading, isSuccess, refetch } = trpc.auth.users.list.useQuery(
    {
      perPage,
      page,
      sortBy,
      sortType,
      search,
    }
  );

  const { mutate } = trpc.auth.users.delete.useMutation();

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

  const deleteUser = () => {
    if (toDeleteId)
      mutate(
        {
          id: toDeleteId,
        },
        {
          onSuccess: (data) => {
            if (data.status) {
              toast.success(data.message);
            } else {
              toast.error(data.message);
            }
            handleClose();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
  };

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
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,

      renderCell: (params: GridRenderCellParams<Date>) => (
        <strong>
          <IconButton
            aria-label="delete"
            href={`/admin/users/edit/${params.row.id}`}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => {
              handleClickOpen(params.row.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </strong>
      ),
    },
  ];

  return (
    <>
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
                components={{
                  Toolbar: SearchAndExport,
                }}
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to Delete User?"}
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={deleteUser} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
