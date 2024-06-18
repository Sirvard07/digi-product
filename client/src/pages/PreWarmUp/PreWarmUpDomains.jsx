import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Typography } from '@mui/material';
import '../Table.css';
import 'ka-table/style.css';

import { Header, SearchBar, CustomLoadingIndicator, CustomModal, CustomTooltipComponent, SubHeader } from '../../components';
import { MdAdd, MdArrowDownward, MdArrowUpward, MdCheck, MdCheckCircle, MdDelete, MdDownload, MdFileDownload, MdFileUpload, MdList, MdPlayArrow, MdRemove, MdUpload, MdUploadFile } from 'react-icons/md';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

import { updateData } from 'ka-table/actionCreators';
import { kaReducer, Table } from 'ka-table';
import { DataType, EditingMode, SortingMode } from 'ka-table/enums';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import { formatDate, themeColorsUsable, preWarmUpSteps } from '../../data/buildData';
import ProgressBar from '../../components/ProgressBar';

const PreWarmUpDomains = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  // Main Data
  const [domainsArray, setDomainsArray] = useState([]);
  const [cPanelAccountsArray, setCPanelAccountsArray] = useState([]);
  const [cPanelAccountOptions, setCPanelAccountOptions] = useState([]);

  
  const [searchTerm, setSearchTerm] = useState('');

  const [domainName, setDomainName] = useState("");
  const [domainNameError, setDomainNameError] = useState("");

  const [isDomainPurchased, setIsDomainPurchased] = useState(false);

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
    getDomains(page, limit, field, newOrder);
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
    if (selectedRows.size === domainsArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(domainsArray.map(item => item._id)));
    }
  };

  // START Add New Item
  const [selectedCPanelAccountId, setSelectedCPanelAccountId] = useState('');
  const [selectedCPanelAccountName, setSelectedCPanelAccountName] = useState('');

  const [openAddDomainModal, setOpenAddDomainModal] = useState(false);

  const resetAddDomainModal = () => {
    setDomainName("");
    setDomainNameError("");
    setIsDomainPurchased(false);
    setSelectedCPanelAccountId('');
    setSelectedCPanelAccountName('');
  }

  const handleOpenAddDomainModal = () => {
    setOpenAddDomainModal(true);
    setIsDomainPurchased(false);
    setSelectedCPanelAccountId(cPanelAccountOptions[0].value);
    setSelectedCPanelAccountName(cPanelAccountOptions[0].label);
  }

  const handleCloseAddDomainModal = () => {
    setOpenAddDomainModal(false);
    resetAddDomainModal();
  }

  const isValidAddDomain = () => {
    var isValid = true;
    // Trim to remove any leading/trailing whitespace
    if (domainName.trim().length === 0) {
      setDomainNameError("Domain name is required.");
      isValid = false;
    }

    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    setDomainNameError("");

    return true;
  };

  const addDomain = async () => {
    setLoadingIndicatorActive(true);

    if (!isValidAddDomain()) {
      setLoadingIndicatorActive(false);
      return;
    }

    try {
      console.log("selectedCPanelAccountId", selectedCPanelAccountId);
      console.log("selectedCPanelAccountName", selectedCPanelAccountName);
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/add-one`, {
        domainName,
        isDomainPurchased,
        cPanelAccountId: selectedCPanelAccountId,
        cPanelAccountName: selectedCPanelAccountName
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseAddDomainModal();
        getDomains(page);
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
  const [openBulkAddDomainsModal, setOpenBulkAddDomainsModal] = useState(false);

  let [uploadCSVFile, setUploadCSVFile] = useState(undefined);
  let [uploadCSVFileName, setUploadCSVFileName] = useState("");

  const handleChangeFileUpload = (e) => {
    setUploadCSVFile(e.target.files[0]);
    setUploadCSVFileName(e.target.files[0].name);
  }

  const handleOpenBulkAddDomainsModal = () => {

    setSelectedCPanelAccountId(cPanelAccountOptions[0].value);
    setSelectedCPanelAccountName(cPanelAccountOptions[0].label);
    setOpenBulkAddDomainsModal(true);
  }

  const handleCloseBulkAddDomainsModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenBulkAddDomainsModal(false);
  }

  const bulkAddDomains = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      // Append the selected cPanel ID and name to the FormData
      formData.append("cPanelAccountId", selectedCPanelAccountId);
      formData.append("cPanelAccountName", selectedCPanelAccountName);

      try {
        const response = await axiosPrivate.post('/api/v1/pre-warmup/domains/add-bulk',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseBulkAddDomainsModal();
          getDomains(page);

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
  // END Bulk Add New Items

  // START Delete Item
  const [domainIdToDelete, setDomainIdToDelete] = useState("");
  const [openDeleteDomainModal, setOpenDeleteDomainModal] = useState(false);

  const handleOpenDeleteDomainModal = (domainId) => {
    setDomainIdToDelete(domainId)
    setOpenDeleteDomainModal(true);
  }

  const handleCloseDeleteDomainModal = () => {
    setDomainIdToDelete("");
    setOpenDeleteDomainModal(false);
  }

  const deleteDomain = async () => {
    setLoadingIndicatorActive(true);
    if (domainIdToDelete.length === 0) {
      handleCloseAddDomainModal();
    }
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/delete-one`, {
        domainIdToDelete,
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        handleCloseDeleteDomainModal();
        getDomains(page);
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
  const [openBulkDeleteDomainsModal, setOpenBulkDeleteDomainsModal] = useState(false);

  const handleCloseBulkDeleteDomainsModal = () => {
    setOpenBulkDeleteDomainsModal(false);
  }
  const handleOpenBulkDeleteDomainsModal = () => {
    setOpenBulkDeleteDomainsModal(true);
  };

  const bulkDeleteDomains = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/delete-bulk`, {
        idsToDelete: Array.from(selectedRows),
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Bulk delete success");
        // Refresh your table data here
        selectedRows.clear();
        handleCloseBulkDeleteDomainsModal();
        getDomains(page);
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

  // START Mark MTA Connected
  const [openMarkMTAConnectedDomainsModal, setOpenMarkMTAConnectedDomainsModal] = useState(false);

  const handleCloseMarkMTAConnectedDomainsModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenMarkMTAConnectedDomainsModal(false);
  }
  const handleOpenMarkMTAConnectedDomainsModal = () => {
    setOpenMarkMTAConnectedDomainsModal(true);
  };

  const markMTAConnectedDomains = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);

      setLoadingIndicatorActive(true);
      try {
        const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/mark-mta-connected`, 
          formData
        ,
          { headers: { 'Content-Type': 'application/json' } });
        if (response.data.success) {
          console.log("MTA Connected success");
          // Refresh your table data here
          selectedRows.clear();
          handleCloseMarkMTAConnectedDomainsModal();
          getDomains(page);
        } else {
          console.log("MTA Connected failure");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingIndicatorActive(false);
      }
    }
  };
  // END Mark MTA Connected


  // START Mark Instantly Connected
  const [openMarkInstantlyConnectedDomainsModal, setOpenMarkInstantlyConnectedDomainsModal] = useState(false);

  const handleCloseMarkInstantlyConnectedDomainsModal = () => {
    setOpenMarkInstantlyConnectedDomainsModal(false);
  }
  const handleOpenMarkInstantlyConnectedDomainsModal = () => {
    setOpenMarkInstantlyConnectedDomainsModal(true);
  };

  const markInstantlyConnectedDomains = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);

      setLoadingIndicatorActive(true);
      try {
        const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/mark-instantly-connected`, 
          formData
        ,
          { headers: { 'Content-Type': 'application/json' } });
        if (response.data.success) {
          console.log("Instantly Connected success");
          // Refresh your table data here
          selectedRows.clear();
          handleCloseMarkInstantlyConnectedDomainsModal();
          getDomains(page);
        } else {
          console.log("Instantly Connected failure");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingIndicatorActive(false);
      }
    }
  };
  // END Mark Instantly Connected


  // START Continue Next Step
  const [openContinueNextStepDomainsModal, setOpenContinueNextStepDomainsModal] = useState(false);

  const handleCloseContinueNextStepDomainsModal = () => {
    setOpenContinueNextStepDomainsModal(false);
  }
  const handleOpenContinueNextStepDomainsModal = () => {
    setOpenContinueNextStepDomainsModal(true);
  };

  const continueNextStepDomains = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/continue-next-step`, {},
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("Continue next step success");
        handleCloseContinueNextStepDomainsModal();
        getDomains(page);
      } else {
        console.log("Continue next step failure");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };
  // END Continue Next Step

  // START Upload DKIM Records
  const [openUploadDKIMRecordsModal, setOpenUploadDKIMRecordsModal] = useState(false);

  const handleOpenUploadDKIMRecordsModal = () => {
    setOpenUploadDKIMRecordsModal(true);
  }

  const handleCloseUploadDKIMRecordsModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenUploadDKIMRecordsModal(false);
  }

  const uploadDKIMRecords = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      try {
        const response = await axiosPrivate.post('/api/v1/pre-warmup/domains/upload-dkim-records',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseUploadDKIMRecordsModal();
          getDomains(page);

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
  // END Upload DKIM Records

  // START Upload Domain Sending Ip Addresses
  const [openUploadDomainSendingIpAddressesModal, setOpenUploadDomainSendingIpAddressesModal] = useState(false);

  const handleOpenUploadDomainSendingIpAddressesModal = () => {
    setOpenUploadDomainSendingIpAddressesModal(true);
  }

  const handleCloseUploadDomainSendingIpAddressesModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenUploadDomainSendingIpAddressesModal(false);
  }

  const uploadDomainSendingIpAddresses = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      try {
        const response = await axiosPrivate.post('/api/v1/pre-warmup/domains/upload-sending-ip-addresses',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseUploadDomainSendingIpAddressesModal();
          getDomains(page);

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
  // END Upload Domain Sending Ip Addresses

  // START Upload Domain MTA API KEYS
  const [openUploadDomainMTAApiKeysModal, setOpenUploadDomainMTAApiKeysModal] = useState(false);

  const handleOpenUploadDomainMTAApiKeysModal = () => {
    setOpenUploadDomainMTAApiKeysModal(true);
  }

  const handleCloseUploadDomainMTAApiKeysModal = () => {
    setUploadCSVFile(undefined);
    setUploadCSVFileName("");
    setOpenUploadDomainMTAApiKeysModal(false);
  }

  const uploadDomainMTAApiKeys = async () => {
    if (uploadCSVFile !== undefined) {
      const formData = new FormData();
      formData.append("file", uploadCSVFile);
      formData.append("fileName", uploadCSVFileName);
      try {
        const response = await axiosPrivate.post('/api/v1/pre-warmup/domains/upload-mta-api-keys',
          formData,
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.success) {
          console.log("success");
          handleCloseUploadDomainMTAApiKeysModal();
          getDomains(page);

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
  // END Upload Domain Sending Ip Addresses

  // START Download Instantly Email File
  const [openDownloadInstantlyEmailFileModal, setOpenDownloadInstantlyEmailFileModal] = useState(false);
  const [selectedInstantlyFileExportType, setSelectedInstantlyFileExportType] = useState("All email accounts");

  const handleOpenDownloadInstantlyEmailFilesModal = () => {
    setSelectedInstantlyFileExportType("All email accounts");
    setOpenDownloadInstantlyEmailFileModal(true);
  }

  const handleCloseDownloadInstantlyEmailFileModal = () => {
    setSelectedInstantlyFileExportType("All email accounts");
    setOpenDownloadInstantlyEmailFileModal(false);
  }
  const downloadInstantlyEmailFile = async () => {
   
    try {
      const response = await axiosPrivate.post('/api/v1/pre-warmup/domains/generate-instantly-upload-file',
        {selectedInstantlyFileExportType},
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

  
  // END Download Instantly Email File


  const downloadDomainsAllData = async () => {
   
    try {
      const response = await axiosPrivate.post('/api/v1/pre-warmup/domains/download-all-data',
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
      { key: 'domainName', title: 'Domain Name', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'cPanelAccountName', title: 'cPanel Account', dataType: DataType.String, colGroup: { style: { minWidth: 200 } }, width: 200 },
      { key: 'status', title: 'Status', dataType: DataType.String, colGroup: { style: { minWidth: 300 } }, width: 300 },
      { key: 'ipAddress', title: 'IP Address', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },

      { key: 'numberOfEmailAccounts', title: 'Number Of Email Accounts', dataType: DataType.String, colGroup: { style: { minWidth: 100 } }, width: 100 },
      { key: 'dateAdded', title: 'Date Added', dataType: DataType.String, colGroup: { style: { minWidth: 150 } }, width: 150 },
      { key: 'Actions', title: 'Actions', dataType: DataType.Object, colGroup: { style: { minWidth: 130 } }, width: 130, },
    ],
    data: domainsArray,
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
  const getDomains = async (newPage = page, newLimit = limit, newSortField = sortField, newSortOrder = sortOrder, newSearchTerm = searchTerm) => {
    setLoadingIndicatorActive(true);

    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(`/api/v1/pre-warmup/domains/get`, {
        limit: newLimit,
        skip,
        sortField: newSortField,
        sortOrder: newSortOrder,
        searchTerm: newSearchTerm
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.success) {
        setDomainsArray(response.data.data.domains);
        setCPanelAccountsArray(response.data.data.cPanelAccounts);

        const cPAccountOptions = response.data.data.cPanelAccounts.map(account => ({
          value: account._id,
          label: account.name
        }));
        // If you need to use cPanelAccountOptions in the state, set it here
        setCPanelAccountOptions(cPAccountOptions);

        setTotalRows(response.data.total);
        const newTotalPages = Math.ceil(response.data.total / newLimit);
        setTotalPages(newTotalPages);
        if (newPage > newTotalPages) {
          setPage(newTotalPages || 1);
        } else {
          setPage(newPage);
        }
        dispatch(updateData(response.data.data.domains));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      getDomains(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);
  // END Get Main Page Data

  // START Setup Modal Views Data
  const elementsAddDomainModal = [
    {
      type: 'title',
      props: {
        label: "Add New Domain",
      }
    },
    {
      type: 'description',
      props: {
        label: "Enter the Domain Name and select a cPanel Account.",
      }
    },
    {
      type: 'inputField',
      props: {
        label: "Domain Name",
        value: domainName,
        required: true,
        error: !!domainNameError, // Changed to boolean for error prop
        helperText: domainNameError,
        onChange: (e) => {
          setDomainName(e.target.value);
          if (domainNameError) setDomainNameError(""); // Reset error when user starts typing
        },
      }
    },
    {
      type: 'select',
      props: {
        label: "cPanel Account",
        name: "cPanel Account",
        value: selectedCPanelAccountId,
        onChange: (e) => {
          setSelectedCPanelAccountId(e.target.value);
          const selectedAccount = cPanelAccountsArray.find(account => account._id === e.target.value);
          setSelectedCPanelAccountName(selectedAccount ? selectedAccount.name : '');
        },
        required: true,
      },
      options: cPanelAccountOptions
    },
    {
      type: 'checkbox',
      props: {
        label: "Is Domain Purchased?",
        checked: isDomainPurchased,
        required: false,
        onChange: (e) => setIsDomainPurchased(e.target.checked), 
      }
    },
  ];

  const elementsDownloadInstantlyEmailFileModal = [
    {
      type: 'title',
      props: {
        label: "Download Instantly Email Connection File",
      }
    },
    {
      type: 'description',
      props: {
        label: "Select whether to download all ready email accounts, or only the ones that are not connected yet.",
      }
    },
    {
      type: 'select',
      props: {
        label: "Instantly File Export Type",
        name: "Instantly File Export Type",
        value: selectedInstantlyFileExportType,
        onChange: (e) => {
          setSelectedInstantlyFileExportType(e.target.value);
        },
        required: true,
      },
      options: [
        {
          value: "All email accounts",
          label: "All email accounts",
        },
        {
          value: "Only not connected yet",
          label: "Only not connected yet",
        },
      ]
    },
  ];

  const elementsBulkAddDomainsModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Add New Domains",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain a Domain Name, and whether it was purchased (true or false), and please choose a cPanel account.",
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
    },
    {
      type: 'select',
      props: {
        label: "cPanel Account",
        name: "cPanel Account",
        value: selectedCPanelAccountId,
        onChange: (e) => {
          setSelectedCPanelAccountId(e.target.value);
          const selectedAccount = cPanelAccountsArray.find(account => account._id === e.target.value);
          setSelectedCPanelAccountName(selectedAccount ? selectedAccount.name : '');
        },
        required: true,
      },
      options: cPanelAccountOptions
    },
  ];

  const elementsUploadDKIMRecordsModal = [
    {
      type: 'title',
      props: {
        label: "Upload DKIM Records",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain the Domain Name, record and value - exactly the same file you would get from the MTA.",
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
  const elementsUploadDomainSendingIpAddressesModal = [
    {
      type: 'title',
      props: {
        label: "Upload Domain Sending IP Addresses",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain the Domain Name and the Sending IP Address. Please make sure that the csv file has headers, labeled 'domain' and 'ip'. Anything else might fail.",
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
  const elementsUploadDomainMTAApiKeysModal = [
    {
      type: 'title',
      props: {
        label: "Upload Domain MTA API Keys",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain the Domain Name and the Api Key. Please make sure that the csv file has headers, labeled 'domain' and 'apiKey'. Anything else might fail.",
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

  const elementsDeleteDomainModal = [
    {
      type: 'title',
      props: {
        label: "Delete Domain",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete this Domain? This will remove all files, email accounts, and remove all connections to Instantly, MTA and cPanel. This action cannot be undone!",
      }
    },
  ];

  const elementsBulkDeleteDomainsModal = [
    {
      type: 'title',
      props: {
        label: "Bulk Delete Domains",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to delete these Domain? This will remove all files, email accounts, and remove all connections to Instantly, MTA and cPanel. This action cannot be undone!",
      }
    },
  ];

  const elementsMarkMTAConnectedDomainsModal = [
    {
      type: 'title',
      props: {
        label: "Mark MTA Connected for Domains",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain only a domain name. This will mark the MTA connection step as complete.",
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
    },
  ];

  const elementsMarkInstantlyConnectedDomainsModal = [
    {
      type: 'title',
      props: {
        label: "Mark Instantly Connected for Domains",
      }
    },
    {
      type: 'description',
      props: {
        label: "Choose a file to upload. Each row must contain only a domain name. This will mark the Instantly connection step as complete.",
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
    },
  ];

  const elementsContinueNextStepDomainsModal = [
    {
      type: 'title',
      props: {
        label: "Continue Domain Setup",
      }
    },
    {
      type: 'description',
      props: {
        label: "Are you sure you wish to continue setting up these Domains? This action will go through all domains that have not completed setup yet, and it will trigger the next step of the setup process.",
      }
    },
  ];

  // END Setup Modal Views Data

  // START Expand Rows
  // State to track expanded rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Function to handle expand/collapse toggle
  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prevExpandedRows) => {
      const newExpandedRows = new Set(prevExpandedRows);
      if (newExpandedRows.has(rowId)) {
        newExpandedRows.delete(rowId);
      } else {
        newExpandedRows.add(rowId);
      }
      return newExpandedRows;
    });
  };


  // END Expand Rows
  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Pre-Warm Up" title="Domains" />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchClick={() => getDomains(page, limit, sortField, sortOrder, searchTerm)}
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />

      <CustomModal
        open={openAddDomainModal}
        handleClose={handleCloseAddDomainModal}
        elements={elementsAddDomainModal}
        confirmFunction={addDomain}
      />

      <CustomModal
        open={openBulkAddDomainsModal}
        handleClose={handleCloseBulkAddDomainsModal}
        elements={elementsBulkAddDomainsModal}
        confirmFunction={bulkAddDomains}
      />

      <CustomModal
        open={openDownloadInstantlyEmailFileModal}
        handleClose={handleCloseDownloadInstantlyEmailFileModal}
        elements={elementsDownloadInstantlyEmailFileModal}
        confirmFunction={downloadInstantlyEmailFile}
      />

      <CustomModal
        open={openDeleteDomainModal}
        handleClose={handleCloseDeleteDomainModal}
        elements={elementsDeleteDomainModal}
        confirmFunction={deleteDomain}
      />

      <CustomModal
        open={openBulkDeleteDomainsModal}
        handleClose={handleCloseBulkDeleteDomainsModal}
        elements={elementsBulkDeleteDomainsModal}
        confirmFunction={bulkDeleteDomains}
      />

      <CustomModal
        open={openUploadDKIMRecordsModal}
        handleClose={handleCloseUploadDKIMRecordsModal}
        elements={elementsUploadDKIMRecordsModal}
        confirmFunction={uploadDKIMRecords}
      />

      <CustomModal
        open={openUploadDomainSendingIpAddressesModal}
        handleClose={handleCloseUploadDomainSendingIpAddressesModal}
        elements={elementsUploadDomainSendingIpAddressesModal}
        confirmFunction={uploadDomainSendingIpAddresses}
      />

      <CustomModal
        open={openUploadDomainMTAApiKeysModal}
        handleClose={handleCloseUploadDomainMTAApiKeysModal}
        elements={elementsUploadDomainMTAApiKeysModal}
        confirmFunction={uploadDomainMTAApiKeys}
      />

      <CustomModal
        open={openMarkMTAConnectedDomainsModal}
        handleClose={handleCloseMarkMTAConnectedDomainsModal}
        elements={elementsMarkMTAConnectedDomainsModal}
        confirmFunction={markMTAConnectedDomains}
      />

      <CustomModal
        open={openMarkInstantlyConnectedDomainsModal}
        handleClose={handleCloseMarkInstantlyConnectedDomainsModal}
        elements={elementsMarkInstantlyConnectedDomainsModal}
        confirmFunction={markInstantlyConnectedDomains}
      />

      <CustomModal
        open={openContinueNextStepDomainsModal}
        handleClose={handleCloseContinueNextStepDomainsModal}
        elements={elementsContinueNextStepDomainsModal}
        confirmFunction={continueNextStepDomains}
      />

      <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
        <CustomTooltipComponent
          icon={MdAdd}
          tooltipText="Add New Domain"
          onClick={handleOpenAddDomainModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdList}
          tooltipText="Bulk Add New Domains"
          onClick={handleOpenBulkAddDomainsModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdRemove}
          tooltipText="Bulk Delete Domains"
          onClick={handleOpenBulkDeleteDomainsModal}
          currentColor={themeColorsUsable.red}
          disabled={selectedRows.size === 0}
        />
        &nbsp;
     
        <CustomTooltipComponent
          icon={MdFileDownload}
          tooltipText="Download Instantly Email File"
          onClick={handleOpenDownloadInstantlyEmailFilesModal}
          currentColor={currentColor}
        />
        &nbsp;
        
        <CustomTooltipComponent
          icon={MdPlayArrow}
          tooltipText="Continue Domain Setup"
          onClick={handleOpenContinueNextStepDomainsModal}
          currentColor={currentColor}
        />
      </div>

      <div className='flex justify-end mb-10 -mt-8 mr-10 md:mr-20'>
        <CustomTooltipComponent
          icon={MdDownload}
          tooltipText="Download All Data"
          onClick={downloadDomainsAllData}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdUpload}
          tooltipText="Upload DKIM Records"
          onClick={handleOpenUploadDKIMRecordsModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdUpload}
          tooltipText="Upload Domain Sending IP Addresses"
          onClick={handleOpenUploadDomainSendingIpAddressesModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdUpload}
          tooltipText="Upload Domain MTA API Keys"
          onClick={handleOpenUploadDomainMTAApiKeysModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdUpload}
          tooltipText="Upload Domains to Mark MTA Complete"
          onClick={handleOpenMarkMTAConnectedDomainsModal}
          currentColor={currentColor}
        />
        &nbsp;
        <CustomTooltipComponent
          icon={MdUpload}
          tooltipText="Upload Domains to Mark Instantly Complete"
          onClick={handleOpenMarkInstantlyConnectedDomainsModal}
          currentColor={currentColor}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>

        <Table
          {...tableProps}
          dispatch={dispatch}
          childComponents={{
            noDataRow: {
              content: () => 'No Domains Found'
            },
            headCell: {
              content: props => {
                if (props.column.key === 'selection-column') {
                  return (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === domainsArray.length}
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
                  case 'status': {
                    const isExpanded = expandedRows.has(props.rowData._id);
                    return (
                      <>
                        <div className='flex align-middle'>
                          <ProgressBar domain={props.rowData} />
                          <button onClick={() => toggleRowExpansion(props.rowData._id)}>
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </div>
                        {isExpanded && (
                            <div>
                              {/* Render the detailed steps here */}
                              {preWarmUpSteps.map((step, index) => (
                                <Typography key={index} variant="body2" color="textSecondary" sx={{ mt: 1, mb: 1 }}>
                                  <strong>{step.label}</strong>: {props.rowData[step.key] ? <span className='text-lime-700'>Complete</span> : <span className='text-rose-700'>Incomplete</span>}
                                </Typography>
                              ))}
                            </div>
                          )}
                      </>
                    );
                  }
                  case 'Actions': return (
                    <div className='flex'>
                      <CustomTooltipComponent
                        icon={AiFillDelete}
                        tooltipText="Delete Domain"
                        onClick={() => handleOpenDeleteDomainModal(props.rowData._id)}
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
            getDomains(1, e.target.value);
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
          onChange={(event, newPage) => getDomains(newPage)}
        />
      </div>
    </div>
  );
};

export default PreWarmUpDomains;