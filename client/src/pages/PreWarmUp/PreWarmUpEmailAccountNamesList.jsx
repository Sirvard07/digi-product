import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import '../Table.css';
import 'ka-table/style.css';

import { Header, SearchBar, CustomLoadingIndicator, CustomModal, CustomTooltipComponent, SubHeader } from '../../components';
import { MdAdd, MdList, MdRemove } from 'react-icons/md';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

import { updateData } from 'ka-table/actionCreators';
import { kaReducer, Table } from 'ka-table';
import { DataType, EditingMode, SortingMode } from 'ka-table/enums';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import { formatDate, themeColorsUsable } from '../../data/buildData';

const PreWarmUpEmailAccountNamesList = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  // Main Data
  const [emailAccountNamesArray, setEmailAccountNamesArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");

  const [lastName, setLastName] = useState("");
  const [isRequired, setIsRequired] = useState(false);


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
    getEmailAccountNames(page, limit, field, newOrder);
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
    if (selectedRows.size === emailAccountNamesArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(emailAccountNamesArray.map(item => item._id)));
    }
  };

  // START Add New Item
  const [openAddEmailAccountNameModal, setOpenAddEmailAccountNameModal] = useState(false);

  const resetAddEmailAccountNameModal = () => {
    setFirstName("");
    setFirstNameError("");
    setLastName("");
    setIsRequired(false);
  }

  const handleOpenAddEmailAccountNameModal = () => {
    setOpenAddEmailAccountNameModal(true);
  }

  const handleCloseAddEmailAccountNameModal = () => {
    setOpenAddEmailAccountNameModal(false);
    resetAddEmailAccountNameModal();
  }
  const isValidAddEmailAccountName = () => {
    // Trim to remove any leading/trailing whitespace
    if (firstName.trim().length === 0) {
        setFirstNameError("First name is required.");
        return false;
    }
    // Reset error message if validation passes
    setFirstNameError("");
    return true;
  };
  const addEmailAccountName = async () => {
    setLoadingIndicatorActive(true);
    
    if (!isValidAddEmailAccountName()){
      setLoadingIndicatorActive(false);
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-account-names-list/add-one`, {
        firstName,
        lastName,
        isRequired
      },
        { headers: { 'Content-Type': 'application/json' } });
        if (response.data.success) {
          console.log("success");
          handleCloseAddEmailAccountNameModal();
          getEmailAccountNames(page);
        } else {
          console.log("Failure");
        }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  }
  // END Add New Item

  // START Bulk Add New Items
  const [openBulkAddEmailAccountNameModal, setOpenBulkAddEmailAccountNameModal] = useState(false);

  let [uploadCSVFile, setUploadCSVFile] = useState(undefined);
  let [uploadCSVFileName, setUploadCSVFileName] = useState("");

  const handleChangeFileUpload = (e) => {
    setUploadCSVFile(e.target.files[0]);
    setUploadCSVFileName(e.target.files[0].name);
  }

  const handleOpenBulkAddEmailAccountNameModal = () => {
    setOpenBulkAddEmailAccountNameModal(true);
  }

  const handleCloseBulkAddEmailAccountNameModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenBulkAddEmailAccountNameModal(false);
  }

  const bulkAddEmailAccountNames = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      try {
        const response = await axiosPrivate.post('/api/v1/pre-warmup/email-account-names-list/add-bulk',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseBulkAddEmailAccountNameModal();
          getEmailAccountNames(page);

        } else {
          console.log("Failure");
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoadingIndicatorActive(false);
      }
    }
  }
  // END

  // START Delete Item
  const [emailAccountNameIdToDelete, setEmailAccountNameIdToDelete] = useState("");
  const [openDeleteEmailAccountNameModal, setOpenDeleteEmailAccountNameModal] = useState(false);

  const handleOpenDeleteEmailAccountNameModal = (emailAccountNameId) => {
    setEmailAccountNameIdToDelete(emailAccountNameId)
    setOpenDeleteEmailAccountNameModal(true);
  }

  const handleCloseDeleteEmailAccountNameModal = () => {
    setEmailAccountNameIdToDelete("");
    setOpenDeleteEmailAccountNameModal(false);
  }

  const deleteEmailAccountName = async () => {
    setLoadingIndicatorActive(true);
    if (emailAccountNameIdToDelete.length === 0){
      handleCloseAddEmailAccountNameModal();
    }
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-account-names-list/delete-one`, {
        emailAccountNameIdToDelete,
      },
        { headers: { 'Content-Type': 'application/json' } });
        if (response.data.success) {
          console.log("success");
          handleCloseDeleteEmailAccountNameModal();
          getEmailAccountNames(page);
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

  // START Edit Item
  const [emailAccountNameIdToEdit, setEmailAccountNameIdToEdit] = useState("");
  const [openEditEmailAccountNameModal, setOpenEditEmailAccountNameModal] = useState(false);

  const resetEditEmailAccountNameModal = () => {
    setEmailAccountNameIdToEdit("");
    setFirstName("");
    setFirstNameError("");
    setLastName("");
    setIsRequired(false);
  }

  const handleOpenEditEmailAccountNameModal = (emailAccountNameId) => {
    setEmailAccountNameIdToEdit(emailAccountNameId);
    for (var i = 0; i < emailAccountNamesArray.length; i++) {
      if (emailAccountNamesArray[i]._id === emailAccountNameId) { 
        setFirstName(emailAccountNamesArray[i].firstName);
        setLastName(emailAccountNamesArray[i].lastName);
        setIsRequired(emailAccountNamesArray[i].isRequired);
        break;
      }
    }
    setOpenEditEmailAccountNameModal(true);
  }

  const handleCloseEditEmailAccountNameModal = () => {
    setOpenEditEmailAccountNameModal(false);
    resetEditEmailAccountNameModal();
  }
  
  const isValidEditEmailAccountName = () => {
    // Trim to remove any leading/trailing whitespace
    if (firstName.trim().length === 0) {
        setFirstNameError("First name is required.");
        return false;
    }
    if (emailAccountNameIdToEdit.trim().length === 0) {
      return false;
    }
    // Reset error message if validation passes
    setFirstNameError("");
    return true;
  };
  
  const editEmailAccountName = async (objectId) => {
    setLoadingIndicatorActive(true);
    console.log("first name", firstName);
    console.log("last name", lastName);
    console.log("is req", isRequired);
    
    if (!isValidEditEmailAccountName()){

      setLoadingIndicatorActive(false);
      // show error message for first name field
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-account-names-list/edit-one`, {
        emailAccountNameIdToEdit,
        firstName,
        lastName,
        isRequired
      },
        { headers: { 'Content-Type': 'application/json' } });
        if (response.data.success) {
          console.log("success");
          handleCloseEditEmailAccountNameModal();
          getEmailAccountNames(page);
        } else {
          console.log("Failure");
        }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  }
  // END Edit Item

  // START Bulk Delete
  const [openBulkDeleteEmailAccountNameModal, setOpenBulkDeleteEmailAccountNameModal] = useState(false);

  const handleCloseBulkDeleteEmailAccountNameModal = () => {
    setOpenBulkDeleteEmailAccountNameModal(false);
  }
  const handleOpenBulkDeleteEmailAccountNameModal = () => {
    setOpenBulkDeleteEmailAccountNameModal(true);
  };

  const bulkDeleteEmailAccountNames = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-account-names-list/delete-bulk`, {
        idsToDelete: Array.from(selectedRows),
      },
      { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Bulk delete success");
        // Refresh your table data here
        selectedRows.clear();
        handleCloseBulkDeleteEmailAccountNameModal();
        getEmailAccountNames(page);
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

  // START Table Configuration
  const ROW_MOUSE_ENTER = 'ROW_MOUSE_ENTER';
  const ROW_MOUSE_LEAVE = 'ROW_MOUSE_LEAVE';

  const tablePropsInit = {
    columns: [
      { key: 'selection-column', title: '', dataType: DataType.Boolean, width: 50, style: { textAlign: 'center' }, headerStyle: { textAlign: 'center' }},
      { key: '_id', title: 'ID', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200, },
      { key: 'firstName', title: 'First Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastName', title: 'Last Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'isRequired', title: 'Is Required?', dataType: DataType.String, colGroup: { style: { minWidth: 100 } }, width: 100 },
      { key: 'Actions', title: 'Actions', dataType: DataType.Object, colGroup: { style: { minWidth: 200 } }, width: 200, },
    ],
    data: emailAccountNamesArray,
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
  const getEmailAccountNames = async (newPage = page, newLimit = limit, newSortField = sortField, newSortOrder = sortOrder, newSearchTerm = searchTerm) => {
    setLoadingIndicatorActive(true);
  
    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/email-account-names-list/get`, {
        limit: newLimit,
        skip,
        sortField: newSortField,
        sortOrder: newSortOrder,
        searchTerm: newSearchTerm
      }, { headers: { 'Content-Type': 'application/json' } });
  
      if (response.data.success) {
        setEmailAccountNamesArray(response.data.data);
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
      getEmailAccountNames(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);
  // END Get Main Page Data

  // START Setup Modal Views Data
  const elementsAddEmailAccountNameModal = [
    {
      type: 'title',
      props: {
        label: "Add New Email Account Name",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the first name, last name, and check if it should be always required.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "First Name",
        value: firstName,
        required: true,
        error: !!firstNameError, // Changed to boolean for error prop
        helperText: firstNameError,
        onChange: (e) => {
          setFirstName(e.target.value);
          if (firstNameError) setFirstNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Last Name",
        value: lastName,
        required: false,
        onChange: (e) => setLastName(e.target.value),
      }
    },
    {
      type: 'checkbox',
      props: {
        label: "Is Required?",
        checked: isRequired,
        required: false,
        onChange: (e) => setIsRequired(e.target.checked), 
      }
    },
  ];

  const elementsBulkAddEmailAccountNameModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Add New Email Account Name",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain at least a First Name.",
      }
    },
    {
      type: 'file',
      props: {
        label: "CSV File",
        value: uploadCSVFile,
        required: true,
        onChange: (e) => handleChangeFileUpload(e),
      }
    }
  ];

  const elementsEditEmailAccountNameModal = [
    {
      type: 'title',
      props: {
        label: "Edit Email Account Name",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the first name, last name, and check if it should be always required.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "First Name",
        value: firstName,
        required: true,
        error: !!firstNameError, // Changed to boolean for error prop
        helperText: firstNameError,
        onChange: (e) => {
          setFirstName(e.target.value);
          if (firstNameError) setFirstNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Last Name",
        value: lastName,
        required: false,
        onChange: (e) => setLastName(e.target.value),
      }
    },
    {
      type: 'checkbox',
      props: {
        label: "Is Required?",
        checked: isRequired,
        required: false,
        onChange: (e) => setIsRequired(e.target.checked), 
      }
    },
  ];

  const elementsDeleteEmailAccountNameModal = [
    {
      type: 'title',
      props: {
        label: "Delete Email Account Name",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete this Email Account Name? This action cannot be undone!",
      }
    },
  ];

  const elementsBulkDeleteEmailAccountNameModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Delete Email Account Name",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete these Email Account Names? This action cannot be undone!",
      }
    },
  ];

  // END Setup Modal Views Data


  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Pre-Warm Up" title="Email Account Names" />
      
      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onSearchClick={() => getEmailAccountNames(page, limit, sortField, sortOrder, searchTerm)}
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />
      
      <CustomModal 
        open={openAddEmailAccountNameModal}
        handleClose={handleCloseAddEmailAccountNameModal}
        elements={elementsAddEmailAccountNameModal}
        confirmFunction={addEmailAccountName}
      />

      <CustomModal 
        open={openBulkAddEmailAccountNameModal}
        handleClose={handleCloseBulkAddEmailAccountNameModal}
        elements={elementsBulkAddEmailAccountNameModal}
        confirmFunction={bulkAddEmailAccountNames}
      />

      <CustomModal 
        open={openEditEmailAccountNameModal}
        handleClose={handleCloseEditEmailAccountNameModal}
        elements={elementsEditEmailAccountNameModal}
        confirmFunction={editEmailAccountName}
      />
      
      <CustomModal 
        open={openDeleteEmailAccountNameModal}
        handleClose={handleCloseDeleteEmailAccountNameModal}
        elements={elementsDeleteEmailAccountNameModal}
        confirmFunction={deleteEmailAccountName}
      />

      <CustomModal 
        open={openBulkDeleteEmailAccountNameModal}
        handleClose={handleCloseBulkDeleteEmailAccountNameModal}
        elements={elementsBulkDeleteEmailAccountNameModal}
        confirmFunction={bulkDeleteEmailAccountNames}
      />

      <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
        <CustomTooltipComponent
            icon={MdAdd}
            tooltipText="Add New Email Account Name"
            onClick={handleOpenAddEmailAccountNameModal}
            currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
            icon={MdList}
            tooltipText="Bulk Add New Email Account Name"
            onClick={handleOpenBulkAddEmailAccountNameModal}
            currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
            icon={MdRemove}
            tooltipText="Bulk Delete Email Account Names"
            onClick={handleOpenBulkDeleteEmailAccountNameModal}
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
              content: () => 'No Email Account Names Found'
            },
            headCell: {
              content: props => {
                  if (props.column.key === 'selection-column') {
                      return (
                          <input
                              type="checkbox"
                              checked={selectedRows.size === emailAccountNamesArray.length}
                              onChange={onSelectAll}
                          />
                      );
                  } else {
                    return (
                      <div onClick={() => handleSort(props.column.key)}>
                        {props.column.title} { props.column.key == sortField ? sortOrder == "asc" ? "↑" : "↓" : ""}
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
                          icon={AiFillEdit}
                          tooltipText="Edit Email Account Name"
                          onClick={() => handleOpenEditEmailAccountNameModal(props.rowData._id)}
                          currentColor={currentColor}
                      />
                      &nbsp;
                      <CustomTooltipComponent
                          icon={AiFillDelete}
                          tooltipText="Delete Email Account Name"
                          onClick={() => handleOpenDeleteEmailAccountNameModal(props.rowData._id)}
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
            getEmailAccountNames(1, e.target.value);
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
          onChange={(event, newPage) => getEmailAccountNames(newPage)}
        />
      </div>
    </div>
  );
};

export default PreWarmUpEmailAccountNamesList;