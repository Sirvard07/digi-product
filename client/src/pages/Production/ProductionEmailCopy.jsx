import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import '../Table.css';
import 'ka-table/style.css';

import { BeeFreeEditor, Header, SearchBar, CustomLoadingIndicator, CustomModal, CustomHTMLPreviewModal, CustomTooltipComponent, SubHeader } from '../../components';
import { MdAdd, MdList, MdRemove } from 'react-icons/md';
import { AiFillDelete, AiFillEdit, AiFillEye } from 'react-icons/ai';

import { updateData } from 'ka-table/actionCreators';
import { kaReducer, Table } from 'ka-table';
import { DataType, EditingMode, SortingMode } from 'ka-table/enums';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import { formatDate, themeColorsUsable } from '../../data/buildData';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import DatePicker from '@mui/lab/DatePicker';
import TextField from '@mui/material/TextField';

// import { modalInitialStyle } from '../data/buildData';

const ProductionEmailCopy = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  // Main Data
  const [emailsArray, setEmailsArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [lastSentDate, setLastSentDate] = useState(new Date());
  const [lastSentDateError, setLastSentDateError] = useState("");

  const [fullHTML, setFullHTML] = useState("");
  const [fullHTMLError, setFullHTMLError] = useState("");
 


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
    getEmailCopies(page, limit, field, newOrder);
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
    if (selectedRows.size === emailsArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(emailsArray.map(item => item._id)));
    }
  };
  
  let [uploadHTMLFile, setUploadHTMLFile] = useState(undefined);
  let [uploadHTMLFileName, setUploadHTMLFileName] = useState("");

  const handleChangeFileUpload = (e) => {
    setUploadHTMLFile(e.target.files[0]);
    setUploadHTMLFileName(e.target.files[0].name);
  }


  // START Create New Email Copy
  const [openCreateEmailCopyModal, setOpenCreateEmailCopyModal] = useState(false);

  const resetCreateEmailCopyModal = () => {
    setName("");
    setNameError("");

  }

  const handleOpenCreateEmailCopyModal = () => {
    setOpenCreateEmailCopyModal(true);
  }

  const handleCloseCreateNewEmailCopyModal = () => {
    setOpenCreateEmailCopyModal(false);
    resetCreateEmailCopyModal();
  }
  const isValidCreateNewEmailCopy = () => {
    const currentDate = new Date();
    var isValid = true;
    // Trim to remove any leading/trailing whitespace
    if (name.trim().length === 0) {
      setNameError("Name is required.");
      isValid = false;
    }
    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setNameError("");
    return true;
  };
  const createEmailCopy = async () => {
    setLoadingIndicatorActive(true);

    if (!isValidCreateNewEmailCopy()) {
      setLoadingIndicatorActive(false);
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/production/email-copy/create-one`, {
        name,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseCreateNewEmailCopyModal();
        getEmailCopies(page);
      } else {
        console.log("Failure");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  }
  // END Create New Email Copy

  // START Preview Email Copy
  const [openPreviewEmailCopyModal, setOpenPreviewEmailCopyModal] = useState(false);


  const handleOpenPreviewEmailCopyModal = (itemHTML) => {
    setFullHTML(itemHTML);
    setOpenPreviewEmailCopyModal(true);
  }

  const handleClosePreviewEmailCopyModal = () => {
    setOpenPreviewEmailCopyModal(false);
    // resetPreviewEmailCopyModal();
  }

  // END Preview Email Copy



  // START Delete Item
  const [emailCopyIdToDelete, setEmailIdToDelete] = useState("");
  const [openDeleteEmailCopyModal, setOpenDeleteEmailCopyModal] = useState(false);

  const handleOpenDeleteEmailCopyModal = (emailId) => {
    setEmailIdToDelete(emailId)
    setOpenDeleteEmailCopyModal(true);
  }

  const handleCloseDeleteEmailCopyModal = () => {
    setEmailIdToDelete("");
    setOpenDeleteEmailCopyModal(false);
  }

  const deleteEmailCopy = async () => {
    setLoadingIndicatorActive(true);
    if (emailCopyIdToDelete.length === 0) {
      handleCloseCreateNewEmailCopyModal();
    }
    try {
      const response = await axiosPrivate.post(`/api/v1/production/email-copy/delete-one`, {
        emailCopyIdToDelete,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseDeleteEmailCopyModal();
        getEmailCopies(page);
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
  const [emailCopyIdToEdit, setEmailIdToEdit] = useState("");
  const [openEditEmailCopyModal, setOpenEditEmailCopyModal] = useState(false);

  const resetEditEmailCopyModal = () => {
    setEmailIdToEdit("");
    setName("");
    setNameError("");
  }

  const handleOpenEditEmailCopyModal = (emailId) => {
    setEmailIdToEdit(emailId);
    for (var i = 0; i < emailsArray.length; i++) {
      if (emailsArray[i]._id === emailId) {
        setName(emailsArray[i].name);
        break;
      }
    }
    setOpenEditEmailCopyModal(true);
  }

  const handleCloseEditEmailCopyModal = () => {
    setOpenEditEmailCopyModal(false);
    resetEditEmailCopyModal();
  }

  const isValidEditEmailCopy = () => {
    var isValid = true;
    const currentDate = new Date();
    // Trim to remove any leading/trailing whitespace
    if (emailCopyIdToEdit.trim().length === 0) {
      isValid = false;
    }
    if (name.trim().length === 0) {
      setNameError("Name is required.");
      isValid = false;
    }
    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setNameError("");
    return true;
  };

  const editEmailCopy = async (objectId) => {
    setLoadingIndicatorActive(true);

    if (!isValidEditEmailCopy()) {

      setLoadingIndicatorActive(false);
      // show error message for first name field
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/production/email-copy/edit-one`, {
        emailCopyIdToEdit,
        name,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseEditEmailCopyModal();
        getEmailCopies(page);
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
  const [openBulkDeleteEmailCopyModal, setOpenBulkDeleteEmailCopyModal] = useState(false);

  const handleCloseBulkDeleteEmailCopyModal = () => {
    setOpenBulkDeleteEmailCopyModal(false);
  }
  const handleOpenBulkDeleteEmailCopyModal = () => {
    setOpenBulkDeleteEmailCopyModal(true);
  };

  const bulkDeleteEmailCopies = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/production/email-copy/delete-bulk`, {
        emailCopiesToDelete: Array.from(selectedRows),
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Bulk delete success");
        // Refresh your table data here
        selectedRows.clear();
        handleCloseBulkDeleteEmailCopyModal();
        getEmailCopies(page);
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
      { key: 'selection-column', title: '', dataType: DataType.Boolean, width: 50, style: { textAlign: 'center' }, headerStyle: { textAlign: 'center' } },
      { key: '_id', title: 'ID', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'name', title: 'Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastSentDate', title: 'Last Sent Date', dataType: DataType.Date, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'dateAdded', title: 'Date Added', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'Actions', title: 'Actions', dataType: DataType.Object, colGroup: { style: { minWidth: 200 } }, width: 200, },
    ],    
    data: emailsArray,
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
  const getEmailCopies = async (newPage = page, newLimit = limit, newSortField = sortField, newSortOrder = sortOrder, newSearchTerm = searchTerm) => {
    setLoadingIndicatorActive(true);

    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(`/api/v1/production/email-copy/get`, {
        limit: newLimit,
        skip,
        sortField: newSortField,
        sortOrder: newSortOrder,
        searchTerm: newSearchTerm
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setEmailsArray(response.data.data);
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
      getEmailCopies(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);


  // useEffect(() => {
  //   // Function to fetch fullHTML from MongoDB
  //   const fetchFullHTML = async () => {
  //     // Fetch logic here
  //     const fetchedHTML = ''; // Placeholder for fetched HTML
  //     setFullHTML(fetchedHTML);
  //   };
  
  //   fetchFullHTML();
  // }, []); // Empty dependency array means this runs once on mount
  //todo

  // END Get Main Page Data

  // START Setup Modal Views Data
  const elementsCreateEmailCopyModal = [
    {
      type: 'title',
      props: {
        label: "Create Email Copy",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Name and create a new Email Copy.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Name",
        value: name,
        required: true,
        error: !!nameError, // Changed to boolean for error prop
        helpertext: nameError,
        onChange: (e) => {
          setName(e.target.value);
          if (nameError) setNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'customComponent',
      props: {
        component: BeeFreeEditor, // Assuming BeeFreeEditor can be used directly. Adjust based on your implementation.
        // Add any props required by BeeFreeEditor here. If it needs to be dynamically created or requires specific handlers, adapt this part accordingly.
        // For example, if BeeFreeEditor needs an initial content or configuration:
        initialContent: "", // Placeholder, replace with actual prop as needed
        // Other props as required by your BeeFreeEditor component
      }
    },
  ];

  const elementsEditEmailCopyModal = [
    {
      type: 'title',
      props: {
        label: "Edit Email Copy",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Name and edit the Email Copy.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Name",
        value: name,
        required: true,
        error: !!nameError, // Changed to boolean for error prop
        helpertext: nameError,
        onChange: (e) => {
          setName(e.target.value);
          if (nameError) setNameError(""); // Reset error when user starts typing
        },
      }
    },
   
  ];

  const elementsDeleteEmailCopyModal = [
    {
      type: 'title',
      props: {
        label: "Delete Email Copy",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete this Email Copy? This action cannot be undone!",
      }
    },
  ];

  const elementsBulkDeleteEmailCopyModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Delete Email Copies",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete these Email Copies? This action cannot be undone!",
      }
    },
  ];

  const elementsPreviewEmailCopyModal = [
    {
      type: 'title',
      props: {
        label: "Email Copy Preview",
      }
      // Add any props required by BeeFreeEditor here. If it needs to be dynamically created or requires specific handlers, adapt this part accordingly.
    },

  ];

  // END Setup Modal Views Data


  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Production" title="Email Copy" />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchClick={() => getEmailCopies(page, limit, sortField, sortOrder, searchTerm)}
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />

      <CustomModal
        open={openCreateEmailCopyModal}
        handleClose={handleCloseCreateNewEmailCopyModal}
        elements={elementsCreateEmailCopyModal}
        confirmFunction={createEmailCopy}
      />

      <CustomModal
        open={openEditEmailCopyModal}
        handleClose={handleCloseEditEmailCopyModal}
        elements={elementsEditEmailCopyModal}
        confirmFunction={editEmailCopy}
      />

      <CustomModal
        open={openDeleteEmailCopyModal}
        handleClose={handleCloseDeleteEmailCopyModal}
        elements={elementsDeleteEmailCopyModal}
        confirmFunction={deleteEmailCopy}
      />

      <CustomModal
        open={openBulkDeleteEmailCopyModal}
        handleClose={handleCloseBulkDeleteEmailCopyModal}
        elements={elementsBulkDeleteEmailCopyModal}
        confirmFunction={bulkDeleteEmailCopies}
      />

      <CustomHTMLPreviewModal
        open={openPreviewEmailCopyModal}
        handleClose={handleClosePreviewEmailCopyModal}
        //  fullHTML={fullHTML} // Assuming this is the HTML string you want to display
        //todo: here we need to pass the fullHTML from the editor
        // fullHTML={"<p>This is the content to preview. This is an html paragraph</p><p>Another paragraph</p><p>And another</p><h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6>"}
        fullHTML={fullHTML}
      />


      <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
        <CustomTooltipComponent
          icon={MdAdd}
          tooltipText="Create New Email Copy"
          onClick={handleOpenCreateEmailCopyModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdRemove}
          tooltipText="Bulk Delete Email Copies"
          onClick={handleOpenBulkDeleteEmailCopyModal}
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
              content: () => 'No Email Copies Found'
            },
            headCell: {
              content: props => {
                if (props.column.key === 'selection-column') {
                  return (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === emailsArray.length}
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
                  case 'lastSentDate': return (
                    formatDate(props.rowData.lastSentDate)
                  );
                  case 'Actions': return (
                    <div className='flex'>
                      <CustomTooltipComponent
                        icon={AiFillEye}
                        tooltipText="Preview Email Copy"
                        onClick={() => handleOpenPreviewEmailCopyModal(props.rowData.fullHTML)}
                        currentColor={currentColor}
                      />
                      &nbsp;
                      <CustomTooltipComponent
                        icon={AiFillEdit}
                        tooltipText="Edit Email Copy"
                        onClick={() => handleOpenEditEmailCopyModal(props.rowData._id)}
                        currentColor={currentColor}
                      />
                      &nbsp;
                      <CustomTooltipComponent
                        icon={AiFillDelete}
                        tooltipText="Delete Email Copy"
                        onClick={() => handleOpenDeleteEmailCopyModal(props.rowData._id)}
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
            getEmailCopies(1, e.target.value);
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
          onChange={(event, newPage) => getEmailCopies(newPage)}
        />
      </div>
    </div>
  );
};

export default ProductionEmailCopy;