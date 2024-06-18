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

const PreWarmUpCPanelAccounts = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  // Main Data
  const [cPanelAccountsArray, setCPanelAccountsArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [primaryDomainName, setPrimaryDomainName] = useState("");
  const [primaryDomainNameError, setPrimaryDomainNameError] = useState("");

  const [ipAddress, setIpAddress] = useState("");
  const [ipAddressError, setIpAddressError] = useState("");

  const [port, setPort] = useState("");
  const [portError, setPortError] = useState("");


  const [whmUsername, setWhmUsername] = useState("");
  const [whmUsernameError, setWhmUsernameError] = useState("");

  const [whmPassword, setWhmPassword] = useState("");
  const [whmPasswordError, setWhmPasswordError] = useState("");

  const [whmApiKey, setWhmApiKey] = useState("");
  const [whmApiKeyError, setWhmApiKeyError] = useState("");

  const [cPanelUsername, setCPanelUsername] = useState("");
  const [cPanelUsernameError, setCPanelUsernameError] = useState("");

  const [cPanelPassword, setCPanelPassword] = useState("");
  const [cPanelPasswordError, setCPanelPasswordError] = useState("");

  const [cPanelApiKey, setCPanelApiKey] = useState("");
  const [cPanelApiKeyError, setCPanelApiKeyError] = useState("");


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
    getCPanelAccounts(page, limit, field, newOrder);
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
    if (selectedRows.size === cPanelAccountsArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(cPanelAccountsArray.map(item => item._id)));
    }
  };

  // START Add New Item
  const [openAddCPanelAccountModal, setOpenAddCPanelAccountModal] = useState(false);

  const resetAddCPanelAccountModal = () => {
    setName("");
    setNameError("");

    setIpAddress("");
    setIpAddressError("");

    setPort("");
    setPortError("");

    setPrimaryDomainName("");
    setPrimaryDomainNameError("");

    setWhmUsername("");
    setWhmUsernameError("");

    setWhmPassword("");
    setWhmPasswordError("");

    setWhmApiKey("");
    setWhmApiKeyError("");

    setCPanelUsername("");
    setCPanelUsernameError("");

    setCPanelPassword("");
    setCPanelPasswordError("");

    setCPanelApiKey("");
    setCPanelApiKeyError("");

  }

  const handleOpenAddCPanelAccountModal = () => {
    setOpenAddCPanelAccountModal(true);
  }

  const handleCloseAddCPanelAccountModal = () => {
    setOpenAddCPanelAccountModal(false);
    resetAddCPanelAccountModal();
  }
  const isValidAddCPanelAccount = () => {
    var isValid = true;
    // Trim to remove any leading/trailing whitespace
    if (name.trim().length === 0) {
      setNameError("Name is required.");
      isValid = false;
    }
    if (primaryDomainName.trim().length === 0) {
      setPrimaryDomainNameError("Primary Domain Name is required.");
      isValid = false;
    }
    if (ipAddress.trim().length === 0) {
      setIpAddressError("IP Address is required.");
      isValid = false;
    }
    if (port.trim().length === 0) {
      setPortError("Port is required.");
      isValid = false;
    }
    if (whmApiKey.trim().length === 0) {
      setWhmApiKeyError("WHM API Key is required.");
      isValid = false;
    }
    if (whmUsername.trim().length === 0) {
      setWhmUsernameError("WHM Username is required.");
      isValid = false;
    }
    if (whmPassword.trim().length === 0) {
      setWhmPasswordError("WHM Password is required.");
      isValid = false;
    }
    if (cPanelApiKey.trim().length === 0) {
      setCPanelApiKeyError("cPanel API Key is required.");
      isValid = false;
    }
    if (cPanelUsername.trim().length === 0) {
      setCPanelUsernameError("cPanel Username is required.");
      isValid = false;
    }
    if (cPanelPassword.trim().length === 0) {
      setCPanelPasswordError("cPanel Password is required.");
      isValid = false;
    }

    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setNameError("");
    setIpAddressError("");
    setPortError("");
    setPrimaryDomainNameError("");
    setWhmUsernameError("");
    setWhmPasswordError("");
    setWhmApiKeyError("");
    setCPanelUsernameError("");
    setCPanelPasswordError("");
    setCPanelApiKeyError("");

    return true;
  };
  const addCPanelAccount = async () => {
    setLoadingIndicatorActive(true);

    if (!isValidAddCPanelAccount()) {
      setLoadingIndicatorActive(false);
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/c-panel-accounts/add-one`, {
        name,
        primaryDomainName,
        ipAddress,
        port,
        whmUsername,
        whmPassword,
        whmApiKey,
        cPanelUsername,
        cPanelPassword,
        cPanelApiKey
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseAddCPanelAccountModal();
        getCPanelAccounts(page);
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
  const [openBulkAddCPanelAccountModal, setOpenBulkAddCPanelAccountModal] = useState(false);

  let [uploadCSVFile, setUploadCSVFile] = useState(undefined);
  let [uploadCSVFileName, setUploadCSVFileName] = useState("");

  const handleChangeFileUpload = (e) => {
    setUploadCSVFile(e.target.files[0]);
    setUploadCSVFileName(e.target.files[0].name);
  }

  const handleOpenBulkAddCPanelAccountModal = () => {
    setOpenBulkAddCPanelAccountModal(true);
  }

  const handleCloseBulkAddCPanelAccountModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenBulkAddCPanelAccountModal(false);
  }

  const bulkAddCPanelAccounts = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      try {
        const response = await axiosPrivate.post('/api/v1/pre-warmup/c-panel-accounts/add-bulk',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseBulkAddCPanelAccountModal();
          getCPanelAccounts(page);

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
  const [cPanelAccountIdToDelete, setCPanelAccountIdToDelete] = useState("");
  const [openDeleteCPanelAccountModal, setOpenDeleteCPanelAccountModal] = useState(false);

  const handleOpenDeleteCPanelAccountModal = (cPanelAccountId) => {
    setCPanelAccountIdToDelete(cPanelAccountId)
    setOpenDeleteCPanelAccountModal(true);
  }

  const handleCloseDeleteCPanelAccountModal = () => {
    setCPanelAccountIdToDelete("");
    setOpenDeleteCPanelAccountModal(false);
  }

  const deleteCPanelAccount = async () => {
    setLoadingIndicatorActive(true);
    if (cPanelAccountIdToDelete.length === 0) {
      handleCloseAddCPanelAccountModal();
    }
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/c-panel-accounts/delete-one`, {
        cPanelAccountIdToDelete,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseDeleteCPanelAccountModal();
        getCPanelAccounts(page);
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
  const [cPanelAccountIdToEdit, setCPanelAccountIdToEdit] = useState("");
  const [openEditCPanelAccountModal, setOpenEditCPanelAccountModal] = useState(false);

  const resetEditCPanelAccountModal = () => {
    setCPanelAccountIdToEdit("");
    setName("");
    setNameError("");
    setPrimaryDomainName("");
    setPrimaryDomainNameError("");
    setIpAddress("");
    setIpAddressError("");
    setPort("");
    setPortError("");
    setWhmUsername("");
    setWhmUsernameError("");

    setWhmPassword("");
    setWhmPasswordError("");

    setWhmApiKey("");
    setWhmApiKeyError("");

    setCPanelUsername("");
    setCPanelUsernameError("");

    setCPanelPassword("");
    setCPanelPasswordError("");

    setCPanelApiKey("");
    setCPanelApiKeyError("");
  }

  const handleOpenEditCPanelAccountModal = (cPanelAccountId) => {
    setCPanelAccountIdToEdit(cPanelAccountId);
    for (var i = 0; i < cPanelAccountsArray.length; i++) {
      if (cPanelAccountsArray[i]._id === cPanelAccountId) {
        setName(cPanelAccountsArray[i].name);
        setIpAddress(cPanelAccountsArray[i].ipAddress);
        setPort(cPanelAccountsArray[i].port);
        setPrimaryDomainName(cPanelAccountsArray[i].primaryDomainName);
        setWhmUsername(cPanelAccountsArray[i].whmUsername);
        setWhmPassword(cPanelAccountsArray[i].whmPassword);
        setWhmApiKey(cPanelAccountsArray[i].whmApiKey);
        setCPanelUsername(cPanelAccountsArray[i].cPanelUsername);
        setCPanelPassword(cPanelAccountsArray[i].cPanelPassword);
        setCPanelApiKey(cPanelAccountsArray[i].cPanelApiKey);
        break;
      }
    }
    setOpenEditCPanelAccountModal(true);
  }

  const handleCloseEditCPanelAccountModal = () => {
    setOpenEditCPanelAccountModal(false);
    resetEditCPanelAccountModal();
  }

  const isValidEditCPanelAccount = () => {
    var isValid = true;

    // Trim to remove any leading/trailing whitespace
    if (cPanelAccountIdToEdit.trim().length === 0) {
      isValid = false;
    }
    if (name.trim().length === 0) {
      setNameError("Name is required.");
      isValid = false;
    }
    if (primaryDomainName.trim().length === 0) {
      setPrimaryDomainNameError("Primary Domain Name is required.");
      isValid = false;
    }
    if (ipAddress.trim().length === 0) {
      setIpAddressError("IP Address is required.");
      isValid = false;
    }
    if (port.trim().length === 0) {
      setPortError("Port is required.");
      isValid = false;
    }
    if (whmUsername.trim().length === 0) {
      setWhmUsernameError("WHM Username is required.");
      isValid = false;
    }
    if (whmPassword.trim().length === 0) {
      setWhmPasswordError("WHM Password is required.");
      isValid = false;
    }
    if (cPanelApiKey.trim().length === 0) {
      setCPanelApiKeyError("cPanel API Key is required.");
      isValid = false;
    }
    if (cPanelUsername.trim().length === 0) {
      setCPanelUsernameError("cPanel Username is required.");
      isValid = false;
    }
    if (cPanelPassword.trim().length === 0) {
      setCPanelPasswordError("cPanel Password is required.");
      isValid = false;
    }

    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setNameError("");
    setIpAddressError("");
    setPortError("");
    setPrimaryDomainNameError("");
    setWhmUsernameError("");
    setWhmPasswordError("");
    setWhmApiKeyError("");
    setCPanelUsernameError("");
    setCPanelPasswordError("");
    setCPanelApiKeyError("");
    return true;
  };

  const editCPanelAccount = async (objectId) => {
    setLoadingIndicatorActive(true);

    if (!isValidEditCPanelAccount()) {

      setLoadingIndicatorActive(false);
      // show error message for first name field
      return;
    }

    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/c-panel-accounts/edit-one`, {
        cPanelAccountIdToEdit,
        name,
        primaryDomainName,
        ipAddress,
        port,
        whmUsername,
        whmPassword,
        whmApiKey,
        cPanelUsername,
        cPanelPassword,
        cPanelApiKey
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseEditCPanelAccountModal();
        getCPanelAccounts(page);
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
  const [openBulkDeleteCPanelAccountModal, setOpenBulkDeleteCPanelAccountModal] = useState(false);

  const handleCloseBulkDeleteCPanelAccountModal = () => {
    setOpenBulkDeleteCPanelAccountModal(false);
  }
  const handleOpenBulkDeleteCPanelAccountModal = () => {
    setOpenBulkDeleteCPanelAccountModal(true);
  };

  const bulkDeleteCPanelAccounts = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/c-panel-accounts/delete-bulk`, {
        idsToDelete: Array.from(selectedRows),
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Bulk delete success");
        // Refresh your table data here
        selectedRows.clear();
        handleCloseBulkDeleteCPanelAccountModal();
        getCPanelAccounts(page);
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
      { key: '_id', title: 'ID', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200, },
      { key: 'name', title: 'Name', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'whmUsername', title: 'WHM Username', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'cPanelUsername', title: 'cPanel Username', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'primaryDomainName', title: 'Primary Domain Name', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'ipAddress', title: 'IP Address', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'port', title: 'Port', dataType: DataType.String, colGroup: { style: { minWidth: 120 } }, width: 120 },
      { key: 'numberOfDomains', title: 'Number Of Domains', dataType: DataType.String, colGroup: { style: { minWidth: 100 } }, width: 100 },
      { key: 'dateAdded', title: 'Date Added', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'Actions', title: 'Actions', dataType: DataType.Object, colGroup: { style: { minWidth: 200 } }, width: 200, },
    ],
    data: cPanelAccountsArray,
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
  const getCPanelAccounts = async (newPage = page, newLimit = limit, newSortField = sortField, newSortOrder = sortOrder, newSearchTerm = searchTerm) => {
    setLoadingIndicatorActive(true);

    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/c-panel-accounts/get`, {
        limit: newLimit,
        skip,
        sortField: newSortField,
        sortOrder: newSortOrder,
        searchTerm: newSearchTerm
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setCPanelAccountsArray(response.data.data);
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
      getCPanelAccounts(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);
  // END Get Main Page Data

  // START Setup Modal Views Data
  const elementsAddCPanelAccountModal = [
    {
      type: 'title',
      props: {
        label: "Add New cPanel Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Name, Primary Domain Name, IP Address, Port, WHM Username, WHM Password, WHM API Key, cPanel Username, cPanel Password, cPanel API Key.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Name",
        value: name,
        required: true,
        error: !!nameError, // Changed to boolean for error prop
        helperText: nameError,
        onChange: (e) => {
          setName(e.target.value);
          if (nameError) setNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Primary Domain Name",
        value: primaryDomainName,
        required: true,
        error: !!primaryDomainNameError, // Changed to boolean for error prop
        helperText: primaryDomainNameError,
        onChange: (e) => {
          setPrimaryDomainName(e.target.value);
          if (primaryDomainNameError) setPrimaryDomainNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "IP Address",
        value: ipAddress,
        required: true,
        error: !!ipAddressError, // Changed to boolean for error prop
        helperText: ipAddressError,
        onChange: (e) => {
          setIpAddress(e.target.value);
          if (ipAddressError) setIpAddressError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Port",
        value: port,
        required: true,
        error: !!portError, // Changed to boolean for error prop
        helperText: portError,
        onChange: (e) => {
          setPort(e.target.value);
          if (portError) setPortError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "WHM Username",
        value: whmUsername,
        required: true,
        error: !!whmUsernameError, // Changed to boolean for error prop
        helperText: whmUsernameError,
        onChange: (e) => {
          setWhmUsername(e.target.value);
          if (whmUsernameError) setWhmUsernameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "WHM Password",
        name: "whmPassword",
        value: whmPassword,
        required: true,
        error: !!whmPasswordError,
        helperText: whmPasswordError,
        onChange: (e) => {
          setWhmPassword(e.target.value);
          if (whmPasswordError) setWhmPasswordError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "WHM API Key",
        value: whmApiKey,
        name: "whmApiKey",
        required: true,
        error: !!whmApiKeyError,
        helperText: whmApiKeyError,
        onChange: (e) => {
          setWhmApiKey(e.target.value);
          if (whmApiKeyError) setWhmApiKeyError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "cPanel Username",
        value: cPanelUsername,
        required: true,
        error: !!cPanelUsernameError, // Changed to boolean for error prop
        helperText: cPanelUsernameError,
        onChange: (e) => {
          setCPanelUsername(e.target.value);
          if (cPanelUsernameError) setCPanelUsernameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "cPanel Password",
        name: "cPanelPassword",
        value: cPanelPassword,
        required: true,
        error: !!cPanelPasswordError,
        helperText: cPanelPasswordError,
        onChange: (e) => {
          setCPanelPassword(e.target.value);
          if (cPanelPasswordError) setCPanelPasswordError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "cPanel API Key",
        value: cPanelApiKey,
        name: "cPanelApiKey",
        required: true,
        error: !!cPanelApiKeyError,
        helperText: cPanelApiKeyError,
        onChange: (e) => {
          setCPanelApiKey(e.target.value);
          if (cPanelApiKeyError) setCPanelApiKeyError(""); // Reset error when user starts typing
        },
      }
    },
    // EXAMPLE FOR SELECT DROPDOWN
    // {
    //   type: 'select',
    //   props: {
    //     label: "Type",
    //     value: type,
    //     onChange: (e) => setType(e.target.value),
    //     required: true,
    //     error: !!typeError, // Add this line if you want to show error
    //     helperText: typeError, // Add this line if you want to show error helper text
    //   },
    //   options: [
    //     { value: 'Hosting', label: 'Hosting' },
    //     { value: 'IMAP', label: 'IMAP' }
    //   ]
    // },
  ];

  const elementsBulkAddCPanelAccountModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Add New cPanel Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain a Name, Primary Domain Name, IP Address, Port, WHM Username, WHM Password, WHM API Key, cPanel Username, cPanel Password, cPanel API Key - in this order.",
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

  const elementsEditCPanelAccountModal = [
    {
      type: 'title',
      props: {
        label: "Edit cPanel Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Name, Primary Domain Name, IP Address, Port, WHM Username, WHM Password, WHM API Key, cPanel Username, cPanel Password, cPanel API Key.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Name",
        value: name,
        required: true,
        error: !!nameError, // Changed to boolean for error prop
        helperText: nameError,
        onChange: (e) => {
          setName(e.target.value);
          if (nameError) setNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Primary Domain Name",
        value: primaryDomainName,
        required: true,
        error: !!primaryDomainNameError, // Changed to boolean for error prop
        helperText: primaryDomainNameError,
        onChange: (e) => {
          setPrimaryDomainName(e.target.value);
          if (primaryDomainNameError) setPrimaryDomainNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "IP Address",
        value: ipAddress,
        required: true,
        error: !!ipAddressError, // Changed to boolean for error prop
        helperText: ipAddressError,
        onChange: (e) => {
          setIpAddress(e.target.value);
          if (ipAddressError) setIpAddressError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Port",
        value: port,
        required: true,
        error: !!portError, // Changed to boolean for error prop
        helperText: portError,
        onChange: (e) => {
          setPort(e.target.value);
          if (portError) setPortError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "WHM Username",
        value: whmUsername,
        required: true,
        error: !!whmUsernameError, // Changed to boolean for error prop
        helperText: whmUsernameError,
        onChange: (e) => {
          setWhmUsername(e.target.value);
          if (whmUsernameError) setWhmUsernameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "WHM Password",
        name: "whmPassword",
        value: whmPassword,
        required: true,
        error: !!whmPasswordError,
        helperText: whmPasswordError,
        onChange: (e) => {
          setWhmPassword(e.target.value);
          if (whmPasswordError) setWhmPasswordError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "WHM API Key",
        value: whmApiKey,
        name: "whmApiKey",
        required: true,
        error: !!whmApiKeyError,
        helperText: whmApiKeyError,
        onChange: (e) => {
          setWhmApiKey(e.target.value);
          if (whmApiKeyError) setWhmApiKeyError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'inputField',
      props: {
        label: "cPanel Username",
        value: cPanelUsername,
        required: true,
        error: !!cPanelUsernameError, // Changed to boolean for error prop
        helperText: cPanelUsernameError,
        onChange: (e) => {
          setCPanelUsername(e.target.value);
          if (cPanelUsernameError) setCPanelUsernameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "cPanel Password",
        name: "cPanelPassword",
        value: cPanelPassword,
        required: true,
        error: !!cPanelPasswordError,
        helperText: cPanelPasswordError,
        onChange: (e) => {
          setCPanelPassword(e.target.value);
          if (cPanelPasswordError) setCPanelPasswordError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'passwordField',
      props: {
        label: "cPanel API Key",
        value: cPanelApiKey,
        name: "cPanelApiKey",
        required: true,
        error: !!cPanelApiKeyError,
        helperText: cPanelApiKeyError,
        onChange: (e) => {
          setCPanelApiKey(e.target.value);
          if (cPanelApiKeyError) setCPanelApiKeyError(""); // Reset error when user starts typing
        },
      }
    },
  ];

  const elementsDeleteCPanelAccountModal = [
    {
      type: 'title',
      props: {
        label: "Delete cPanel Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete this cPanel Account? This action cannot be undone!",
      }
    },
  ];

  const elementsBulkDeleteCPanelAccountModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Delete cPanel Account",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete these cPanel Accounts? This action cannot be undone!",
      }
    },
  ];

  // END Setup Modal Views Data


  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Pre-Warm Up" title="CPanel Accounts" />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchClick={() => getCPanelAccounts(page, limit, sortField, sortOrder, searchTerm)}
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />

      <CustomModal
        open={openAddCPanelAccountModal}
        handleClose={handleCloseAddCPanelAccountModal}
        elements={elementsAddCPanelAccountModal}
        confirmFunction={addCPanelAccount}
      />

      <CustomModal
        open={openBulkAddCPanelAccountModal}
        handleClose={handleCloseBulkAddCPanelAccountModal}
        elements={elementsBulkAddCPanelAccountModal}
        confirmFunction={bulkAddCPanelAccounts}
      />

      <CustomModal
        open={openEditCPanelAccountModal}
        handleClose={handleCloseEditCPanelAccountModal}
        elements={elementsEditCPanelAccountModal}
        confirmFunction={editCPanelAccount}
      />

      <CustomModal
        open={openDeleteCPanelAccountModal}
        handleClose={handleCloseDeleteCPanelAccountModal}
        elements={elementsDeleteCPanelAccountModal}
        confirmFunction={deleteCPanelAccount}
      />

      <CustomModal
        open={openBulkDeleteCPanelAccountModal}
        handleClose={handleCloseBulkDeleteCPanelAccountModal}
        elements={elementsBulkDeleteCPanelAccountModal}
        confirmFunction={bulkDeleteCPanelAccounts}
      />

      <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
        <CustomTooltipComponent
          icon={MdAdd}
          tooltipText="Add New cPanel Account"
          onClick={handleOpenAddCPanelAccountModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdList}
          tooltipText="Bulk Add New cPanel Account"
          onClick={handleOpenBulkAddCPanelAccountModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdRemove}
          tooltipText="Bulk Delete cPanel Accounts"
          onClick={handleOpenBulkDeleteCPanelAccountModal}
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
              content: () => 'No cPanel Accounts Found'
            },
            headCell: {
              content: props => {
                if (props.column.key === 'selection-column') {
                  return (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === cPanelAccountsArray.length}
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
                        icon={AiFillEdit}
                        tooltipText="Edit cPanel Account"
                        onClick={() => handleOpenEditCPanelAccountModal(props.rowData._id)}
                        currentColor={currentColor}
                      />
                      &nbsp;
                      <CustomTooltipComponent
                        icon={AiFillDelete}
                        tooltipText="Delete cPanel Account"
                        onClick={() => handleOpenDeleteCPanelAccountModal(props.rowData._id)}
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
            getCPanelAccounts(1, e.target.value);
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
          onChange={(event, newPage) => getCPanelAccounts(newPage)}
        />
      </div>
    </div>
  );
};

export default PreWarmUpCPanelAccounts;