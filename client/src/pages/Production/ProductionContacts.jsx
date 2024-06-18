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
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import DatePicker from '@mui/lab/DatePicker';
import TextField from '@mui/material/TextField';

// import { modalInitialStyle } from '../data/buildData';

const ProductionContacts = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  // Main Data
  const [contactsArray, setContactsArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");

  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const [source, setSource] = useState("");
  const [sourceError, setSourceError] = useState("");

  const [acquiredDate, setAcquiredDate] = useState(new Date("2000-01-01"));
  const [acquiredDateError, setAcquiredDateError] = useState("");

  const [status, setStatus] = useState("Active");
  const [statusError, setStatusError] = useState("");

  const [statusReason, setStatusReason] = useState("Active");
  const [statusReasonError, setStatusReasonError] = useState("");

  const [lastSentDate, setLastSentDate] = useState(new Date("2000-01-01"));
  const [lastSentDateError, setLastSentDateError] = useState("");

  const [lastOpenDate, setLastOpenDate] = useState(new Date("2000-01-01"));
  const [lastOpenDateError, setLastOpenDateError] = useState("");

  const [lastClickDate, setLastClickDate] = useState(new Date("2000-01-01"));
  const [lastClickDateError, setLastClickDateError] = useState("");


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
    getContacts(page, limit, field, newOrder);
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
    if (selectedRows.size === contactsArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(contactsArray.map(item => item._id)));
    }
  };

  // START Add New Item
  const [openAddContactModal, setOpenAddContactModal] = useState(false);

  const resetAddContactModal = () => {
    setEmail("");
    setEmailError("");

    setFirstName("");
    setFirstNameError("");

    setLastName("");
    setLastNameError("");

    setSource("");
    setSourceError("");

    setAcquiredDate(new Date("2000-01-01"));
    setAcquiredDateError("");

    setStatus("Active");
    setStatusError("");

    setStatusReason("Active");
    setStatusReasonError("");

    setLastSentDate(new Date("2000-01-01"));
    setLastSentDateError("");

    setLastOpenDate(new Date("2000-01-01"));
    setLastOpenDateError("");

    setLastClickDate(new Date("2000-01-01"));
    setLastClickDateError("");

  }

  const handleOpenAddContactModal = () => {
    setOpenAddContactModal(true);
  }

  const handleCloseAddContactModal = () => {
    setOpenAddContactModal(false);
    resetAddContactModal();
  }
  const isValidAddContactAccount = () => {
    const currentDate = new Date();
    var isValid = true;
    // Trim to remove any leading/trailing whitespace
    if (email.trim().length === 0) {
      setEmailError("Email is required.");
      isValid = false;
    }
    if (firstName.trim().length === 0) {
      setFirstNameError("First name is required.");
      isValid = false;
    }
    if (lastName.trim().length === 0) {
      setLastNameError("Last name is required.");
      isValid = false;
    }
    if (source.trim().length === 0) {
      setSourceError("Source is required.");
      isValid = false;
    }
    if (!acquiredDate) {
      setAcquiredDateError("Acquired date is required.");
      isValid = false;
    } else if (acquiredDate > currentDate) {
      setAcquiredDateError("Acquired date must be in the past.");
      isValid = false;
    } 
    // else {
    //   setAcquiredDateError(""); // Reset the error if the date is valid
    // }
    if (status.trim().length === 0) {
      setStatusError("Status is required.");
      isValid = false;
    }
    if (statusReason.trim().length === 0) {
      setStatusReasonError("Status reason is required.");
      isValid = false;
    }
    if (!lastSentDate) {
      setLastSentDateError("Last sent date is required.");
      isValid = false;
    } else if (lastSentDate > currentDate) {
      setLastSentDateError("Last sent date must be in the past.");
      isValid = false;
    } 
    // else {
    //   setLastSentDateError(""); // Reset the error if the date is valid
    // }
    if (!lastOpenDate) {
      setLastOpenDateError("Last open date is required.");
      isValid = false;
    } else if (lastOpenDate > currentDate) {
      setLastOpenDateError("Last open date must be in the past.");
      isValid = false;
    } 
    // else {
    //   lastOpenDateError(""); // Reset the error if the date is valid
    // }
    if (!lastClickDate) {
      setLastOpenDateError("Last click date is required.");
      isValid = false;
    } else if (lastClickDate > currentDate) {
      setLastClickDateError("Last click date must be in the past.");
      isValid = false;
    } 
    // else {
    //   lastClickDateError(""); // Reset the error if the date is valid
    // }
    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setSourceError("");
    setAcquiredDateError("");
    setStatusError("");
    setStatusReasonError("");
    setLastSentDateError("");
    setLastOpenDateError("");
    setLastClickDateError("");
    return true;
  };
  const addContact = async () => {
    setLoadingIndicatorActive(true);

    if (!isValidAddContactAccount()) {
      setLoadingIndicatorActive(false);
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/production/contacts/add-one`, {
        email,
        firstName,
        lastName,
        source,
        acquiredDate,
        status,
        statusReason,
        lastSentDate,
        lastOpenDate,
        lastClickDate,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseAddContactModal();
        getContacts(page);
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
  const [openBulkAddContactModal, setOpenBulkAddContactModal] = useState(false);

  let [uploadCSVFile, setUploadCSVFile] = useState(undefined);
  let [uploadCSVFileName, setUploadCSVFileName] = useState("");

  const handleChangeFileUpload = (e) => {
    setUploadCSVFile(e.target.files[0]);
    setUploadCSVFileName(e.target.files[0].name);
  }

  const handleOpenBulkAddContactModal = () => {
    setOpenBulkAddContactModal(true);
  }

  const handleCloseBulkAddContactModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenBulkAddContactModal(false);
  }

  const bulkAddContacts = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      try {
        const response = await axiosPrivate.post('/api/v1/production/contacts/add-bulk',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseBulkAddContactModal();
          getContacts(page);

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
  const [contactIdToDelete, setContactIdToDelete] = useState("");
  const [openDeleteContactModal, setOpenDeleteContactModal] = useState(false);

  const handleOpenDeleteContactModal = (contactId) => {
    setContactIdToDelete(contactId)
    setOpenDeleteContactModal(true);
  }

  const handleCloseDeleteContactModal = () => {
    setContactIdToDelete("");
    setOpenDeleteContactModal(false);
  }

  const deleteContact = async () => {
    setLoadingIndicatorActive(true);
    if (contactIdToDelete.length === 0) {
      handleCloseAddContactModal();
    }
    try {
      const response = await axiosPrivate.post(`/api/v1/production/contacts/delete-one`, {
        contactIdToDelete,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseDeleteContactModal();
        getContacts(page);
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
  const [contactIdToEdit, setContactIdToEdit] = useState("");
  const [openEditContactModal, setOpenEditContactModal] = useState(false);

  const resetEditContactModal = () => {
    setContactIdToEdit("");
    setEmail("");
    setEmailError("");
    setFirstName("");
    setFirstNameError("");
    setLastName("");
    setLastNameError("");
    setSource("");
    setSourceError("");
    setAcquiredDate(new Date("2000-01-01"))
    setAcquiredDateError("");
    setStatus("Active");
    setStatusError("");
    setStatusReason(" ");
    setStatusReasonError("");
    setLastSentDate(new Date("2000-01-01"));
    setLastSentDateError("");
    setLastOpenDate(new Date("2000-01-01"));
    setLastOpenDateError("");
    setLastClickDate(new Date("2000-01-01"));
    setLastClickDateError("");
  }

  const handleOpenEditContactModal = (contactId) => {
    setContactIdToEdit(contactId);
    for (var i = 0; i < contactsArray.length; i++) {
      if (contactsArray[i]._id === contactId) {
        setEmail(contactsArray[i].email);
        setFirstName(contactsArray[i].firstName);
        setLastName(contactsArray[i].lastName);
        setSource(contactsArray[i].source);
        setAcquiredDate(contactsArray[i].acquiredDate);
        setStatus(contactsArray[i].status);
        setStatusReason(contactsArray[i].statusReason);
        setLastSentDate(contactsArray[i].lastSentDate);
        setLastOpenDate(contactsArray[i].lastOpenDate);
        setLastClickDate(contactsArray[i].lastClickDate);
        break;
      }
    }
    setOpenEditContactModal(true);
  }

  const handleCloseEditContactModal = () => {
    setOpenEditContactModal(false);
    resetEditContactModal();
  }

  const isValidEditContact = () => {
    var isValid = true;
    const currentDate = new Date();
    // Trim to remove any leading/trailing whitespace
    if (contactIdToEdit.trim().length === 0) {
      isValid = false;
    }
    if (email.trim().length === 0) {
      setEmailError("Email is required.");
      isValid = false;
    }
    if (firstName.trim().length === 0) {
      setFirstNameError("First name is required.");
      isValid = false;
    }
    if (lastName.trim().length === 0) {
      setLastNameError("Last name is required.");
      isValid = false;
    }
    if (source.trim().length === 0) {
      setSourceError("Source is required.");
      isValid = false;
    }
    if (!acquiredDate) {
      setAcquiredDateError("Acquired date is required.");
      isValid = false;
    } else if (acquiredDate > currentDate) {
      setAcquiredDateError("Acquired date must be in the past.");
      isValid = false;
    } 
    if (status.trim().length === 0) {
      setStatusError("Status is required.");
      isValid = false;
    }
    if (statusReason.trim().length === 0) {
      setStatusReasonError("Status reason is required.");
      isValid = false;
    }
    if (!lastSentDate) {
      setLastSentDateError("Last sent date is required.");
      isValid = false;
    } else if (lastSentDate > currentDate) {
      setLastSentDateError("Last sent date must be in the past.");
      isValid = false;
    } 
    if (!lastOpenDate) {
      setLastOpenDateError("Last open date is required.");
      isValid = false;
    } else if (lastOpenDate > currentDate) {
      setLastOpenDateError("Last open date must be in the past.");
      isValid = false;
    } 
    if (!lastClickDate) {
      setLastOpenDateError("Last click date is required.");
      isValid = false;
    } else if (lastClickDate > currentDate) {
      setLastClickDateError("Last click date must be in the past.");
      isValid = false;
    } 
    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setSourceError("");
    setAcquiredDateError("");
    setStatusError("");
    setStatusReasonError("");
    setLastSentDateError("");
    setLastOpenDateError("");
    setLastClickDateError("");
    return true;
  };

  const editContact = async (objectId) => {
    setLoadingIndicatorActive(true);

    if (!isValidEditContact()) {

      setLoadingIndicatorActive(false);
      // show error message for first name field
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/production/contacts/edit-one`, {
        contactIdToEdit,
        email,
        firstName,
        lastName,
        source,
        acquiredDate,
        status,
        statusReason,
        lastSentDate,
        lastOpenDate,
        lastClickDate
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseEditContactModal();
        getContacts(page);
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
  const [openBulkDeleteContactModal, setOpenBulkDeleteContactModal] = useState(false);

  const handleCloseBulkDeleteContactModal = () => {
    setOpenBulkDeleteContactModal(false);
  }
  const handleOpenBulkDeleteContactModal = () => {
    setOpenBulkDeleteContactModal(true);
  };

  const bulkDeleteContacts = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/production/contacts/delete-bulk`, {
        idsToDelete: Array.from(selectedRows),
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Bulk delete success");
        // Refresh your table data here
        selectedRows.clear();
        handleCloseBulkDeleteContactModal();
        getContacts(page);
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
      { key: 'email', title: 'Email', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'firstName', title: 'First Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastName', title: 'Last Name', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'source', title: 'Source', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'acquiredDate', title: 'Acquired Date', dataType: DataType.Date, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'status', title: 'Status', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'statusReason', title: 'Status Reason', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastSentDate', title: 'Last Sent Date', dataType: DataType.Date, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastOpenDate', title: 'Last Open Date', dataType: DataType.Date, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'lastClickDate', title: 'Last Click Date', dataType: DataType.Date, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'dateAdded', title: 'Date Added', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'Actions', title: 'Actions', dataType: DataType.Object, colGroup: { style: { minWidth: 200 } }, width: 200, },
    ],    
    data: contactsArray,
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
  const getContacts = async (newPage = page, newLimit = limit, newSortField = sortField, newSortOrder = sortOrder, newSearchTerm = searchTerm) => {
    setLoadingIndicatorActive(true);

    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(`/api/v1/production/contacts/get`, {
        limit: newLimit,
        skip,
        sortField: newSortField,
        sortOrder: newSortOrder,
        searchTerm: newSearchTerm
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setContactsArray(response.data.data);
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
      getContacts(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);
  // END Get Main Page Data

  // START Setup Modal Views Data
  const elementsAddContactModal = [
    {
      type: 'title',
      props: {
        label: "Add New Contact",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Email, First Name, Last Name, Source, Acquired Date, Status, Status Reason, Last Sent Date, Last Open Date and Last Click Date.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Email",
        value: email,
        required: true,
        error: !!emailError, // Changed to boolean for error prop
        helpertext: emailError,
        onChange: (e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "First Name",
        value: firstName,
        required: true,
        error: !!firstNameError, // Changed to boolean for error prop
        helpertext: firstNameError,
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
        required: true,
        error: !!lastNameError, // Changed to boolean for error prop
        helpertext: lastNameError,
        onChange: (e) => {
          setLastName(e.target.value);
          if (lastNameError) setLastNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Source",
        value: source,
        required: true,
        error: !!sourceError, // Changed to boolean for error prop
        helpertext: sourceError,
        onChange: (e) => {
          setSource(e.target.value);
          if (sourceError) setSourceError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'datepicker',
      props: {
        label: 'Acquired Date',
        value: acquiredDate,
        renderInput: (params) => (
          <TextField 
            {...params}
            error={!!acquiredDateError}
           // helpertext={acquiredDateError}
            type="text" // use text type for DatePicker
          />
        ),
        onChange: (date) => {
          setAcquiredDate(date);
          if (acquiredDateError) setAcquiredDateError('');
        },
      },
    },
    {
      type: 'select',
      props: {
        label: "Status",
        value: status,
        onChange: (e) => {
          setStatus(e.target.value);

          // Set Status Reason options based on the selected value of "Status"
          switch (e.target.value) {
            case 'Active':
              setStatusReason('Active'); // Set Status Reason to empty value
              break;
            case 'Unsubscribed':
              setStatusReason('User Unsubbed'); // Set Status Reason to default value
              break;
            case 'Suppressed':
              setStatusReason('Failed ipqs'); // Set Status Reason to default value
              break;
            default:
              // You can set a default option or leave it empty based on your requirements
              setStatusReason('');
              break;
          }
        },
        required: true,
        error: !!statusError,
        helpertext: statusError,
      },
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Unsubscribed', label: 'Unsubscribed' },
        { value: 'Suppressed', label: 'Suppressed' },
      ]
    },
    {
      type: 'select',
      props: {
        label: "Status Reason",
        value: statusReason,
        onChange: (e) => setStatusReason(e.target.value),
        required: true,
        error: !!statusReasonError,
        helpertext: statusReasonError,
      },
      // Set options based on the selected value of the "Status" field
      options: (() => {
        switch (status) {
          case 'Active':
            return [{ value: 'Active', label: 'Active' }];
          case 'Unsubscribed':
            return [
              { value: 'User Unsubbed', label: 'User Unsubbed' },
              { value: 'Admin Unsubbed', label: 'Admin Unsubbed' },
            ];
          case 'Suppressed':
            return [{ value: 'Failed ipqs', label: 'Failed ipqs' }];
          default:
            // You can set a default option or leave it empty based on your requirements
            return [];
        }
      })(),
    },
    {
      type: 'datepicker',
      props: {
        label: 'Last Sent Date',
        value: lastSentDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!lastSentDateError}
            //helpertext={lastSentDateError}
          />
        ),
        onChange: (date) => {
          setLastSentDate(date);
          if (lastSentDateError) setLastSentDateError("");
        },
      },
    },
    {
      type: 'datepicker',
      props: {
        label: 'Last Open Date',
        value: lastOpenDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!lastOpenDateError}
            //helpertext={lastOpenDateError}
          />
        ),
        onChange: (date) => {
          setLastOpenDate(date);
          if (lastOpenDateError) setLastOpenDateError("");
        },
      },
    },
    {
      type: 'datepicker',
      props: {
        label: 'Last Click Date',
        value: lastClickDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!lastClickDateError}
            //helpertext={lastClickDateError}
          />
        ),
        onChange: (date) => {
          setLastClickDate(date);
          if (lastClickDateError) setLastClickDateError("");
        },
      },
    },
  ];

  const elementsBulkAddContactModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Add New Contacts",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain an Email, First Name, Last Name, Source, Acquired Date, Status, Status Reason, Last Sent Date, Last Open Date and Last Click Date - in this order.",
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

  const elementsEditContactModal = [
    {
      type: 'title',
      props: {
        label: "Edit Contact",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Email, First Name, Last Name, Source, Acquired Date, Status, Status Reason, Last Sent Date, Last Open Date and Last Click Date.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Email",
        value: email,
        required: true,
        error: !!emailError, // Changed to boolean for error prop
        helpertext: emailError,
        onChange: (e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "First Name",
        value: firstName,
        required: true,
        error: !!firstNameError, // Changed to boolean for error prop
        helpertext: firstNameError,
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
        required: true,
        error: !!lastNameError, // Changed to boolean for error prop
        helpertext: lastNameError,
        onChange: (e) => {
          setLastName(e.target.value);
          if (lastNameError) setLastNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Source",
        value: source,
        required: true,
        error: !!sourceError, // Changed to boolean for error prop
        helpertext: sourceError,
        onChange: (e) => {
          setSource(e.target.value);
          if (sourceError) setSourceError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'datepicker',
      props: {
        label: 'Acquired Date',
        value: acquiredDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!acquiredDateError}
            //helpertext={acquiredDateError}
          />
        ),
        onChange: (date) => {
          setAcquiredDate(date);
          if (acquiredDateError) setAcquiredDateError("");
        },
      },
    },
    {
      type: 'select',
      props: {
        label: "Status",
        value: status,
        onChange: (e) => {
          setStatus(e.target.value);

          // Set Status Reason options based on the selected value of "Status"
          switch (e.target.value) {
            case 'Active':
              setStatusReason('Active'); // Set Status Reason to empty value
              break;
            case 'Unsubscribed':
              setStatusReason('User Unsubbed'); // Set Status Reason to default value
              break;
            case 'Suppressed':
              setStatusReason('Failed ipqs'); // Set Status Reason to default value
              break;
            default:
              // You can set a default option or leave it empty based on your requirements
              setStatusReason('');
              break;
          }
        },
        required: true,
        error: !!statusError,
        helpertext: statusError,
      },
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Unsubscribed', label: 'Unsubscribed' },
        { value: 'Suppressed', label: 'Suppressed' },
      ]
    },
    {
      type: 'select',
      props: {
        label: "Status Reason",
        value: statusReason,
        onChange: (e) => setStatusReason(e.target.value),
        required: true,
        error: !!statusReasonError,
        helpertext: statusReasonError,
      },
      // Set options based on the selected value of the "Status" field
      options: (() => {
        switch (status) {
          case 'Active':
            return [{ value: 'Active', label: 'Active' }];
          case 'Unsubscribed':
            return [
              { value: 'User Unsubbed', label: 'User Unsubbed' },
              { value: 'Admin Unsubbed', label: 'Admin Unsubbed' },
            ];
          case 'Suppressed':
            return [{ value: 'Failed ipqs', label: 'Failed ipqs' }];
          default:
            // You can set a default option or leave it empty based on your requirements
            return [];
        }
      })(),
    },

    {
      type: 'datepicker',
      props: {
        label: 'Last Sent Date',
        value: lastSentDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!lastSentDateError}
            //helpertext={lastSentDateError}
          />
        ),
        onChange: (date) => {
          setLastSentDate(date);
          if (lastSentDateError) setLastSentDateError("");
        },
      },
    },
    {
      type: 'datepicker',
      props: {
        label: 'Last Open Date',
        value: lastOpenDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!lastOpenDateError}
            //helpertext={lastOpenDateError}
          />
        ),
        onChange: (date) => {
          setLastOpenDate(date);
          if (lastOpenDateError) setLastOpenDateError("");
        },
      },
    },
    {
      type: 'datepicker',
      props: {
        label: 'Last Click Date',
        value: lastClickDate,
        renderInput: (params) => (
          <TextField
            {...params}
            type="text" // use text type for DatePicker
            error={!!lastClickDateError}
            //helpertext={lastClickDateError}
          />
        ),
        onChange: (date) => {
          setLastClickDate(date);
          if (lastClickDateError) setLastClickDateError("");
        },
      },
    },
  ];

  const elementsDeleteContactModal = [
    {
      type: 'title',
      props: {
        label: "Delete Contact",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete this Contact? This action cannot be undone!",
      }
    },
  ];

  const elementsBulkDeleteContactModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Delete Contacts",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete these Contacts? This action cannot be undone!",
      }
    },
  ];

  // END Setup Modal Views Data


  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Production" title="Contacts" />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchClick={() => getContacts(page, limit, sortField, sortOrder, searchTerm)}
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />

      <CustomModal
        open={openAddContactModal}
        handleClose={handleCloseAddContactModal}
        elements={elementsAddContactModal}
        confirmFunction={addContact}
      />

      <CustomModal
        open={openBulkAddContactModal}
        handleClose={handleCloseBulkAddContactModal}
        elements={elementsBulkAddContactModal}
        confirmFunction={bulkAddContacts}
      />

      <CustomModal
        open={openEditContactModal}
        handleClose={handleCloseEditContactModal}
        elements={elementsEditContactModal}
        confirmFunction={editContact}
      />

      <CustomModal
        open={openDeleteContactModal}
        handleClose={handleCloseDeleteContactModal}
        elements={elementsDeleteContactModal}
        confirmFunction={deleteContact}
      />

      <CustomModal
        open={openBulkDeleteContactModal}
        handleClose={handleCloseBulkDeleteContactModal}
        elements={elementsBulkDeleteContactModal}
        confirmFunction={bulkDeleteContacts}
      />

      <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
        <CustomTooltipComponent
          icon={MdAdd}
          tooltipText="Add New Contact"
          onClick={handleOpenAddContactModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdList}
          tooltipText="Bulk Add New Contacts"
          onClick={handleOpenBulkAddContactModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdRemove}
          tooltipText="Bulk Delete Contacts"
          onClick={handleOpenBulkDeleteContactModal}
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
              content: () => 'No Contacts Found'
            },
            headCell: {
              content: props => {
                if (props.column.key === 'selection-column') {
                  return (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === contactsArray.length}
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
                  case 'acquiredDate': return (
                    formatDate(props.rowData.acquiredDate)
                  );
                  case 'lastSentDate': return (
                    formatDate(props.rowData.lastSentDate)
                  );
                  case 'lastOpenDate': return (
                    formatDate(props.rowData.lastOpenDate)
                  );
                  case 'lastClickDate': return (
                    formatDate(props.rowData.lastClickDate)
                  );
                  case 'Actions': return (
                    <div className='flex'>
                      <CustomTooltipComponent
                        icon={AiFillEdit}
                        tooltipText="Edit Contact"
                        onClick={() => handleOpenEditContactModal(props.rowData._id)}
                        currentColor={currentColor}
                      />
                      &nbsp;
                      <CustomTooltipComponent
                        icon={AiFillDelete}
                        tooltipText="Delete Contact"
                        onClick={() => handleOpenDeleteContactModal(props.rowData._id)}
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
            getContacts(1, e.target.value);
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
          onChange={(event, newPage) => getContacts(newPage)}
        />
      </div>
    </div>
  );
};

export default ProductionContacts;