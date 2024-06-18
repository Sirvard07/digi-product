import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import '../Table.css';
import 'ka-table/style.css';

import { Header, SearchBar, CustomLoadingIndicator, CustomModal, CustomTooltipComponent, SubHeader } from '../../components';
import { MdAdd, MdFileDownload, MdList, MdRemove } from 'react-icons/md';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

import { updateData } from 'ka-table/actionCreators';
import { kaReducer, Table } from 'ka-table';
import { DataType, EditingMode, SortingMode } from 'ka-table/enums';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import { formatDate, themeColorsUsable } from '../../data/buildData';

const PreWarmUpEmailAccounts = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  // Main Data
  const [emailAccountsArray, setEmailAccountsArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');


  // Table pagination
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [totalRows, setTotalRows] = useState(0); // Total number of rows
  const [limit, setLimit] = useState(10); // Items per page

  // Table Sort
  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  const handleSort = (field) => {
    let newOrder = 'asc';
    if (sortField === field && sortOrder === 'asc') {
      newOrder = 'desc';
    }
    setSortField(field);
    setSortOrder(newOrder);
    getEmailAccounts(page, limit, field, newOrder);
  };

  // Table bulk selection
  const [selectedRows, setSelectedRows] = useState(new Set());
  const onSelectionChange = (rowKeyValue) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowKeyValue)) {
        newSet.delete(rowKeyValue);
      } else {
        newSet.add(rowKeyValue);
      }
      return newSet;
    });
  };

  const onSelectAll = () => {
    if (selectedRows.size === emailAccountsArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(emailAccountsArray.map(item => item._id)));
    }
  };

  // START Delete Item
  const [emailAccountIdToDelete, setEmailAccountIdToDelete] = useState("");
  const [openDeleteEmailAccountModal, setOpenDeleteEmailAccountModal] = useState(false);

  const handleOpenDeleteEmailAccountModal = (emailAccountId) => {
    setEmailAccountIdToDelete(emailAccountId)
    setOpenDeleteEmailAccountModal(true);
  }

  const handleCloseDeleteEmailAccountModal = () => {
    setEmailAccountIdToDelete("");
    setOpenDeleteEmailAccountModal(false);
  }

  const deleteEmailAccount = async () => {
    setLoadingIndicatorActive(true);
    if (emailAccountIdToDelete.length === 0) {
      handleCloseDeleteEmailAccountModal();
    }
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-accounts/delete-one`, {
        emailAccountIdToDelete,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseDeleteEmailAccountModal();
        getEmailAccounts(page);
      } else {
        console.log("Failure");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  }

  // END Delete Item

  // START Bulk Delete
  const [openBulkDeleteEmailAccountModal, setOpenBulkDeleteEmailAccountModal] = useState(false);

  const handleCloseBulkDeleteEmailAccountModal = () => {
    setOpenBulkDeleteEmailAccountModal(false);
  }
  const handleOpenBulkDeleteEmailAccountModal = () => {
    setOpenBulkDeleteEmailAccountModal(true);
  };

  const bulkDeleteEmailAccounts = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-accounts/delete-bulk`, {
        idsToDelete: Array.from(selectedRows),
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Bulk delete success");
        // Refresh your table data here
        selectedRows.clear();
        handleCloseBulkDeleteEmailAccountModal();
        getEmailAccounts(page);
      } else {
        console.log("Bulk delete failure");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };
  // END Bulk Delete  

  const downloadEmailAccountsAllData = async () => {
   
    try {
      const response = await axiosPrivate.post('/api/v1/pre-warmup/email-accounts/download-all-data',
        {},
        {
           headers: { 'Content-Type': 'application/json' },
            responseType: "blob" 
        }
      )

      // Create a new Blob object using the response data of the file
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Create a link element, use it to download the blob, and then remove it
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Use the file name from the Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition.split('filename=')[1].replaceAll('"', '');

      link.setAttribute('download', fileName); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up and remove the link

    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  
  }

  // START Table Configuration
  const ROW_MOUSE_ENTER = 'ROW_MOUSE_ENTER';
  const ROW_MOUSE_LEAVE = 'ROW_MOUSE_LEAVE';

  const tablePropsInit = {
    columns: [
      { key: 'selection-column', title: '', dataType: DataType.Boolean, width: 50, style: { textAlign: 'center' }, headerStyle: { textAlign: 'center' } },
      { key: '_id', title: 'ID', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200, },
      { key: 'fullEmail', title: 'Email', dataType: DataType.String, colGroup: { style: { minWidth: 250 } }, width: 250 },
      { key: 'name', title: 'Name', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'firstName', title: 'First Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastName', title: 'Last Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'domainName', title: 'Domain Name', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'cPanelAccountName', title: 'cPanel Account', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'isConnectedToInstantly', title: 'Connected To Instantly', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'dateAdded', title: 'Date Added', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'Actions', title: 'Actions', dataType: DataType.Object, colGroup: { style: { minWidth: 150 } }, width: 150, },
    ],
    data: emailAccountsArray,
    editingMode: EditingMode.None,
    rowKeyField: '_id',
    sortingMode: SortingMode.SingleRemote,
  };
  const [tableProps, changeTableProps] = useState(tablePropsInit);
  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action));
  };

  // END Table Configuration

  // START Get Main Page Data
  const getEmailAccounts = async (newPage = page, newLimit = limit, newSortField = sortField, newSortOrder = sortOrder, newSearchTerm = searchTerm) => {
    setLoadingIndicatorActive(true);

    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-accounts/get`, {
        limit: newLimit,
        skip,
        sortField: newSortField,
        sortOrder: newSortOrder,
        searchTerm: newSearchTerm
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setEmailAccountsArray(response.data.data);
        setTotalRows(response.data.total);
        const newTotalPages = Math.ceil(response.data.total / newLimit);
        setTotalPages(newTotalPages);
        if (newPage > newTotalPages) {
          setPage(newTotalPages || 1);
        } else {
          setPage(newPage);
        }
        dispatch(updateData(response.data.data));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      getEmailAccounts(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);
  // END Get Main Page Data

  // START Setup Modal Views Data
  
  const elementsDeleteEmailAccountModal = [
    {
      type: 'title',
      props: {
        label: "Delete email Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete this email Account? This will remove the email account from cPanel and Instantly. This action cannot be undone!",
      }
    },
  ];

  const elementsBulkDeleteEmailAccountModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Delete email Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete these email Accounts?  This will remove the email accounts from cPanel and Instantly. This action cannot be undone!",
      }
    },
  ];

  // END Setup Modal Views Data


  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Pre-Warm Up" title="Email Accounts" />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchClick={() => getEmailAccounts(page, limit, sortField, sortOrder, searchTerm)}
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />

      <CustomModal
        open={openDeleteEmailAccountModal}
        handleClose={handleCloseDeleteEmailAccountModal}
        elements={elementsDeleteEmailAccountModal}
        confirmFunction={deleteEmailAccount}
      />

      <CustomModal
        open={openBulkDeleteEmailAccountModal}
        handleClose={handleCloseBulkDeleteEmailAccountModal}
        elements={elementsBulkDeleteEmailAccountModal}
        confirmFunction={bulkDeleteEmailAccounts}
      />

      <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
        <CustomTooltipComponent
          icon={MdFileDownload}
          tooltipText="Download All Data"
          onClick={downloadEmailAccountsAllData}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdRemove}
          tooltipText="Bulk Delete email Accounts"
          onClick={handleOpenBulkDeleteEmailAccountModal}
          currentColor={themeColorsUsable.red}
          disabled={selectedRows.size === 0}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>

        <Table
          {...tableProps}
          dispatch={dispatch}
          childComponents={{
            noDataRow: {
              content: () => 'No email Accounts Found'
            },
            headCell: {
              content: props => {
                if (props.column.key === 'selection-column') {
                  return (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === emailAccountsArray.length}
                      onChange={onSelectAll}
                    />
                  );
                } else {
                  return (
                    <div onClick={() => handleSort(props.column.key)}>
                      {props.column.title} {props.column.key == sortField ? sortOrder == "asc" ? "↑" : "↓" : ""}
                    </div>
                  );
                }
              }
            },

            dataRow: {
              elementAttributes: (props) => ({
                onMouseEnter: (event, extendedEvent) => {
                  const {
                    childProps: {
                      rowKeyValue,
                    },
                    dispatch,
                  } = extendedEvent;
                  dispatch({ type: ROW_MOUSE_ENTER, rowKeyValue });
                },
                onMouseLeave: (event, { dispatch }) => {
                  dispatch({ type: ROW_MOUSE_LEAVE });
                }
              })
            },
            cell: {
              content: props => {
                if (props.column.key === 'selection-column') {
                  return <input
                    type="checkbox"
                    checked={selectedRows.has(props.rowData._id)}
                    onChange={() => onSelectionChange(props.rowData._id)}
                  />;
                }
                // ... other cell contents
              },
              elementAttributes: () => ({
                // className: 'my-cell-class',
                onClick: (e, extendedEvent) => {
                  // const { childProps: { dispatch } } = extendedEvent;
                  // dispatch({ type: 'MY_CELL_onClick', ...{ extendedEvent }});
                  if (extendedEvent.childProps.column.key !== "Actions") {
                    // console.log("clicked row " + extendedEvent.childProps.rowKeyValue)
                    // navigateToClientDetailsWithID(extendedEvent.childProps.rowKeyValue);
                  }
                },
              })
            },
            cellText: {
              content: (props) => {
                switch (props.column.key) {
                  case 'dateAdded': return (
                    formatDate(props.rowData.dateAdded)
                  );
                  case 'Actions': return (
                    <div className='flex'>
                      <CustomTooltipComponent
                        icon={AiFillDelete}
                        tooltipText="Delete email Account"
                        onClick={() => handleOpenDeleteEmailAccountModal(props.rowData._id)}
                        currentColor={themeColorsUsable.red}
                      />
                    </div>
                  );
                }
              }
            },

          }}
        />
      </div>

      <div className="flex justify-between items-center my-4">
        <Select
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            getEmailAccounts(1, e.target.value);
            setPage(1); // Reset to first page
          }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, newPage) => getEmailAccounts(newPage)}
        />
      </div>
    </div>
  );
};

export default PreWarmUpEmailAccounts;