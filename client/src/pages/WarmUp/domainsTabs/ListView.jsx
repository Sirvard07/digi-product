import { Alert, Box, MenuItem, Pagination, Select, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CustomLoadingIndicator,
  CustomModal,
  CustomTooltipComponent,
  SearchBar,
  SubHeader,
} from "../../../components";
import "ka-table/style.css";
import "../../Table.css";
import {
  AiFillLock,
  AiOutlineRedo,
  AiFillSetting,
  AiOutlineRetweet,
  AiOutlineCheck,
  AiFillCaretRight,
  AiFillFire,
  AiFillCheckCircle,
  AiOutlineMinus
} from "react-icons/ai";
import { themeColorsUsable } from "../../../data/buildData";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import { updateData } from "ka-table/actionCreators";
import { kaReducer, Table } from "ka-table";
import { DataType, EditingMode, SortingMode } from "ka-table/enums";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const ROW_MOUSE_ENTER = "ROW_MOUSE_ENTER";
const ROW_MOUSE_LEAVE = "ROW_MOUSE_LEAVE";

const ListView = () => {
  const navigate = useNavigate();

  const {
    currentColor,
    loggedIn,
    loadingIndicatorActive,
    setLoadingIndicatorActive,
  } = useStateContext();

  const axiosPrivate = useAxiosPrivate();

  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [openLockDomainModal, setOpenLockDomainModal] = useState(false);
  const [openFreezekDomainModal, setOpenFreezekDomainModal] = useState(false);
  const [openRecoveryModeModal, setOpenRecoveryModeModal] = useState(false);
  const [openInRecoveryModeModal, setOpenInRecoveryModeModal] = useState(false);
  const [openRecoveryDoneModal, setOpenRecoveryDoneModal] = useState(false);
  const [openInProductionModal, setOpenInProductionModal] = useState(false);
  const [openInWarmupModal, setOpenInWarmupModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [itemId, setItemId] = useState(null);
  const [recoveryModeSelectedDay, setRecoveryModeSelectedDay] = useState([]);
  const [recoveryModeDay, setRecoveryModeDay] = useState(null);
  const [selectedRecoveryModeDayLimit, setselectedRecoveryModeDayLimit] =
    useState(null);
  const [recoveryModeDayLimitDays, setRecoveryModeDayLimitDays] = useState([]);
  const [dayOnRecoveryMode, setDayOnRecoveryMode] = useState(0);
  const [openAnalytics, setOpenAnalytics] = useState(false);
  const [openRate, setOpenRate] = useState(0);
  const [replyRate, setReplyRate] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainsArray, setDomainsArray] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const elementsLockDomainModal = [
    {
      type: "title",
      props: {
        label: "Freeze the domain",
      },
    },
    {
      type: "description",
      props: {
        label: "Are you sure you wish to freeze this Domain?",
      },
    },
  ];

  const elementsFreezeDomainModal = [
    {
      type: "title",
      props: {
        label: "Freeze the domains",
      },
    },
    {
      type: "description",
      props: {
        label: "Are you sure you wish to freeze this Domain?",
      },
    },
  ];

  const elementsRecoveryModeModal = [
    {
      type: "title",
      props: {
        label: "The domain is freeze",
      },
    },
    {
      type: "description",
      props: {
        label: "You can switch on Recovery mode",
      },
    },
    {
      type: "select",
      props: {
        label: "Warm Up schedule day",
        name: "Warm Up schedule day",
        value: recoveryModeDay,
        onChange: (e) => {
          setRecoveryModeDay(e.target.value);
        },
        required: true,
      },
      options: recoveryModeSelectedDay,
    },
    {
      type: "select",
      props: {
        label: "recovery mode day limit",
        name: "recovery mode day limit",
        value: selectedRecoveryModeDayLimit,
        onChange: (e) => {
          setselectedRecoveryModeDayLimit(e.target.value);
        },
        required: true,
      },
      options: recoveryModeDayLimitDays,
    },
  ];

  const elementsInRecoveryModeModal = [
    {
      type: "title",
      props: {
        label: "The domain is on Recovery mode.",
      },
    },
    {
      type: "description",
      props: {
        label: `${dayOnRecoveryMode} days left to be on recovery mode.`,
      },
    },
  ];

  const elementsRecoveryDoneModal = [
    {
      type: "title",
      props: {
        label: "Recovery mode is completed",
      },
    },
  ];

  const elementsInProductionModal = [
    {
      type: "title",
      props: {
        label: "The domain is also in the Production",
      },
    },
  ];

  const elementsInWarmupModal = [
    {
      type: "title",
      props: {
        label: "The domain is in WarmUp stage only",
      },
    },
  ];

  const elementsAnalyticsModal = [
    {
      type: "title",
      props: {
        label: "Analytics",
      },
    },
    {
      type: "inputField",
      props: {
        label: "open rate",
        value: openRate,
        required: true,
        type: "number",
        max: 100,
        min: 0,
        onChange: (e) => {
          if (e.target.value.length > 1 && e.target.value[0] !== 0) {
            if (Number(e.target.value) >= 0 && Number(e.target.value) <= 100) {
              setOpenRate(e.target.value);
            }
          }
        },
      },
    },
    {
      type: "inputField",
      props: {
        label: "reply rate",
        value: replyRate,
        required: true,
        type: "number",
        max: 100,
        min: 0,
        onChange: (e) => {
          if (e.target.value.length > 1 && e.target.value[0] !== 0) {
            if (Number(e.target.value) >= 0 && Number(e.target.value) <= 100) {
              setReplyRate(e.target.value);
            }
          }
        },
      },
    },
    {
      type: "inputField",
      props: {
        label: "daily limit",
        value: dailyLimit,
        required: true,
        type: "number",
        max: 200,
        min: 0,
        onChange: (e) => {
          if (e.target.value.length > 1 && e.target.value[0] !== 0) {
            if (Number(e.target.value) >= 0 && Number(e.target.value) <= 100) {
              setDailyLimit(e.target.value);
            }
          }
        },
      },
    },
  ];

  const tablePropsInit = {
    columns: [
      {
        key: "selection-column",
        title: "",
        dataType: DataType.Boolean,
        width: 50,
      },
      // {
      //   key: "_id",
      //   title: "ID",
      //   dataType: DataType.String,
      //   colGroup: { style: { minWidth: 150 } },
      //   width: 150,
      // },
      {
        key: "domainName",
        title: "Domain Name",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 150 } },
        width: 150,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "groupName",
        title: "Group Name",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 150 } },
        width: 150,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "cPanelAccountName",
        title: "cPanel Account",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "ipAddress",
        title: "IP Address",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 150 } },
        width: 150,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "numberOfEmailAccounts",
        title: "Number Of Email Accounts",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "currentWarmupDay",
        title: "Current Warmup Day",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "warmupDone",
        title: "First Warmup Done",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "dateConnectedToInstantly",
        title: "Warm up start date",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 200 } },
        width: 200,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "warmupAge",
        title: "Warmup Age",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "recoveryStartDate",
        title: "Recovery start date",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 200 } },
        width: 200,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "recoveryPastDays",
        title: "Recovery past days",
        dataType: DataType.String,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "Stage",
        title: "Stage",
        dataType: DataType.Object,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "Status",
        title: "Status",
        dataType: DataType.Object,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
      {
        key: "Settings",
        title: "Settings",
        dataType: DataType.Object,
        colGroup: { style: { minWidth: 100 } },
        width: 100,
        style: { textAlign: "center", fontSize: "13px", padding: "8px 10px" },
      },
    ],
    data: domainsArray,
    editingMode: EditingMode.None,
    rowKeyField: "_id",
    sortingMode: SortingMode.SingleRemote,
  };

  const [tableProps, changeTableProps] = useState(tablePropsInit);

  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

  const handleCloseLockDomainModal = () => {
    setOpenLockDomainModal(false);
  };

  const getAcc = async (id) => {
    setOpenAnalytics(true);
    try {
      setLoadingIndicatorActive(true);
      const { data } = await axiosPrivate.post(
        `/api/v1/warmup/domains/get-analytics-for-domain-account`,
        { id },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data?.success) {
        setItemId(id);
        setOpenRate(data.data.payload.warmup.advanced?.open_rate || 0);
        setReplyRate(data.data.payload.warmup.reply_rate || 0);
        setDailyLimit(data.data.payload.warmup.limit);
      }
    } catch (error) {
      console.log('error', error.message)
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  // START Get Main Page Data
  const getDomains = async (
    newPage = page,
    newLimit = limit,
    newSortField = sortField,
    newSortOrder = sortOrder,
    newSearchTerm = searchTerm
  ) => {
    setLoadingIndicatorActive(true);

    try {
      const skip = (newPage - 1) * newLimit;
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/get`,
        {
          limit: newLimit,
          skip,
          sortField: newSortField,
          sortOrder: newSortOrder,
          searchTerm: newSearchTerm,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setDomainsArray(response.data.data.domains);

        const cPAccountOptions = response.data.data.cPanelAccounts.map(
          (account) => ({
            value: account._id,
            label: account.name,
          })
        );
        // If you need to use cPanelAccountOptions in the state, set it here

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
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      const days = [];
      for (let day = 1; day <= 45; day++) {
        days.push({
          label: day,
          value: day,
        });
      }
      setRecoveryModeDayLimitDays(days);
      setselectedRecoveryModeDayLimit(days[0].value);
      getDomains(page, limit, sortField, sortOrder);
    } else {
      navigate("/login");
    }
  }, [page, limit, sortField, sortOrder, loggedIn]);

  const handleSort = (field) => {
    let newOrder = "asc";
    if (sortField === field && sortOrder === "asc") {
      newOrder = "desc";
    }
    setSortField(field);
    setSortOrder(newOrder);
    getDomains(page, limit, field, newOrder);
  };

  const onSelectAll = () => {
    if (selectedRows.size === domainsArray.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(domainsArray.map((item) => item._id)));
    }
  };

  const onSelectionChange = (rowKeyValue) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowKeyValue)) {
        newSet.delete(rowKeyValue);
      } else {
        newSet.add(rowKeyValue);
      }
      return newSet;
    });
  };

  const handleCloaseInRecoveryModeModal = () => {
    setOpenInRecoveryModeModal(false);
    setItemId(null);
  };

  const handleCloseRecoveryDoneModal = () => {
    setOpenRecoveryDoneModal(false);
    setItemId(null);
  };
  
  const handleCloseInProductionModal = () => {
    setItemId(null);
    setOpenInProductionModal(false);
  }

  const handleCloseInWarmupModal = () => {
    setItemId(null);
    setOpenInWarmupModal(false);
  }

  const handleCloaseAnalytics = () => {
    setOpenAnalytics(false);
    setItemId(null);
  };

  const handleCloseFreezekDomainModal = () => {
    setOpenFreezekDomainModal(false);
  };

  const handleCloaseRecoveryModeModal = () => {
    setRecoveryModeSelectedDay([]);
    setRecoveryModeDay("");
    setOpenRecoveryModeModal(false);
    setItemId(null);
  };

  const handleOpenRecoveryModeModal = (id) => {
    setItemId(id);
    const domain = domainsArray.find((item) => item._id === id);
    const days = [];
    for (let day = domain.currentWarmupDay; day >= 0; day--) {
      days.push({
        label: day,
        value: day,
      });
    }
    setRecoveryModeSelectedDay(days);
    setRecoveryModeDay(days[0].value);
    setOpenRecoveryModeModal(true);
  };

  const handleOpenInRecoveryModeModal = (id) => {
    setItemId(id);
    const domain = domainsArray.find((item) => item._id === id);
    setDayOnRecoveryMode(domain.recoveryModeDayLimit);
    setOpenInRecoveryModeModal(true);
  };
  const handleOpenRecoveryDoneModal = (id) => {
    setItemId(id);
    setOpenRecoveryDoneModal(true);
  };

  const handleOpenInProductionModal = (id) => {
    setItemId(id);
    setOpenInProductionModal(true);
  }
  
  const handleOpenInWarmupModal = (id) => {
    setItemId(id);
    setOpenInWarmupModal(true);
  }

  const handleRemoveFromProd = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/remove-from-prod`,
        {
          id: itemId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
    setOpenInProductionModal(false);
    setItemId(null);
  } 

  const handleAddToProd = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/add-to-prod`,
        {
          id: itemId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
    setOpenInWarmupModal(false);
    setOpenRecoveryDoneModal(false);
    setItemId(null);
  } 

  const handleInRecoveryMode = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/end-recovery-mode`,
        {
          id: itemId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      handleCloaseInRecoveryModeModal();
      setItemId(null);
    }
  };

  const handleAnalytics = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/update_Analytics`,
        {
          id: itemId,
          openRate: openRate,
          replyRate: replyRate,
          dailyLimit: dailyLimit,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      handleCloaseRecoveryModeModal();
      setItemId(null);
      handleCloaseAnalytics();
    }
  };

  const handleFreezeDomains = async () => {
    setLoadingIndicatorActive(true);
    const newArray = [];
    for (const item of selectedRows.values()) {
      newArray.push(item);
    }
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/lock-domenis`,
        {
          newArray,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
    setOpenFreezekDomainModal(false);
    setSelectedRows(new Set());
  };

  const lockDomain = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/lock`,
        {
          id: itemId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
    setOpenLockDomainModal(false);
    setItemId(null);
  };

  const handleLock = (id) => {
    setItemId(id);
    setOpenLockDomainModal(true);
  };

  const handleRecoveryMode = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/recovery-mode`,
        {
          id: itemId,
          recoveryModeDay: recoveryModeDay,
          recoveryModeDayLimitDay: selectedRecoveryModeDayLimit,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        getDomains(page, limit, sortField, sortOrder);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      handleCloaseRecoveryModeModal();
      setItemId(null);
    }
  };

  return (
    <Box className="my-5">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchClick={() =>
          getDomains(page, limit, sortField, sortOrder, searchTerm)
        }
        currentColor={currentColor}
      />
      <SubHeader title={`Total rows: ${totalRows}`} />
      <div className="flex justify-end pb-2">
        <CustomTooltipComponent
          icon={AiFillLock}
          tooltipText="Freeze"
          onClick={() => {
            if (selectedRows?.size !== 0) {
              setOpenFreezekDomainModal(true);
            }
          }}
          currentColor={themeColorsUsable.red}
        />
      </div>
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />
      <CustomModal
        open={openFreezekDomainModal}
        handleClose={handleCloseFreezekDomainModal}
        elements={elementsFreezeDomainModal}
        confirmFunction={handleFreezeDomains}
      />
      <CustomModal
        open={openLockDomainModal}
        handleClose={handleCloseLockDomainModal}
        elements={elementsLockDomainModal}
        confirmFunction={lockDomain}
      />
      <CustomModal
        open={openRecoveryModeModal}
        handleClose={handleCloaseRecoveryModeModal}
        elements={elementsRecoveryModeModal}
        confirmFunction={handleRecoveryMode}
      />
      <CustomModal
        open={openInRecoveryModeModal}
        handleClose={handleCloaseInRecoveryModeModal}
        elements={elementsInRecoveryModeModal}
        confirmFunction={handleInRecoveryMode}
      />
      <CustomModal
        open={openAnalytics}
        handleClose={handleCloaseAnalytics}
        elements={elementsAnalyticsModal}
        confirmFunction={handleAnalytics}
      />
      <CustomModal
        open={openRecoveryDoneModal}
        handleClose={handleCloseRecoveryDoneModal}
        elements={elementsRecoveryDoneModal}
        confirmFunction={() => {
          setOpenRecoveryDoneModal(false);
          setOpenLockDomainModal(true);
        }}
        confirmText={"Freeze"}
        additionalConfirmFunction={handleAddToProd}
        additionalConfirmText={"Move to Prod"}
      />
      <CustomModal
        open={openInProductionModal}
        handleClose={handleCloseInProductionModal}
        elements={elementsInProductionModal}
        confirmFunction={handleRemoveFromProd}
        confirmText={"Remove from the Prod"}
      />
      <CustomModal
        open={openInWarmupModal}
        handleClose={handleCloseInWarmupModal}
        elements={elementsInWarmupModal}
        confirmFunction={handleAddToProd}
        confirmText={"Add to Prod"}
      />
      <div style={{ overflowX: "auto" }}>
        <Table
          {...tableProps}
          dispatch={dispatch}
          childComponents={{
            noDataRow: {
              content: () => "No Domains Found",
            },
            headCell: {
              content: (props) => {
                if (props.column.key === "selection-column") {
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
                      {props.column.title}{" "}
                      {props.column.key == sortField
                        ? sortOrder == "asc"
                          ? "↑"
                          : "↓"
                        : ""}
                    </div>
                  );
                }
              },
            },

            dataRow: {
              elementAttributes: (props) => ({
                onMouseEnter: (event, extendedEvent) => {
                  const {
                    childProps: { rowKeyValue },
                    dispatch,
                  } = extendedEvent;
                  dispatch({ type: ROW_MOUSE_ENTER, rowKeyValue });
                },
                onMouseLeave: (event, { dispatch }) => {
                  dispatch({ type: ROW_MOUSE_LEAVE });
                },
              }),
            },
            cell: {
              content: (props) => {
                if (props.column.key === "selection-column") {
                  return (
                    <input
                      type="checkbox"
                      checked={selectedRows.has(props.rowData._id)}
                      onChange={() => onSelectionChange(props.rowData._id)}
                    />
                  );
                }
              },
            },
            cellText: {
              content: (props) => {
                const currentDate = new Date();

                const dateConnectedToInstantly = new Date(
                  props.rowData.dateConnectedToInstantly
                );
                const warmupDiffTime = Math.abs(
                  currentDate - dateConnectedToInstantly
                );
                const warmupDiffDays = Math.round(
                  warmupDiffTime / (1000 * 60 * 60 * 24)
                );

                let recoveryDiffDays = null;

                if(props.rowData.recoveryStartDate) {
                  const recoveryStartDate = new Date(
                    props.rowData.recoveryStartDate
                  );
                  const recoveryDiffTime = Math.abs(
                    currentDate - recoveryStartDate
                  );
                  recoveryDiffDays = Math.round(
                    recoveryDiffTime / (1000 * 60 * 60 * 24)
                  );
                }

                switch (props.column.key) {
                  case "groupName":
                    return (
                      <div>{props.rowData.group?.name || "-"}</div>
                    )
                  case "dateConnectedToInstantly":
                    return (
                      <div>{props.rowData.dateConnectedToInstantly?.split("T")[0] || "-"}</div>
                    )
                  case "recoveryStartDate": 
                    return (
                      <div>{props.rowData.recoveryStartDate?.split("T")[0] || "-"}</div>
                    )
                  case "recoveryPastDays":
                    return (
                      <div>{recoveryDiffDays !== null ? `${recoveryDiffDays} day(s)` : "-"}</div>
                    )
                  case "warmupDone": 
                    return (
                      <div className="flex justify-center">{warmupDiffDays > 45 ? <AiOutlineCheck color="#1cab1c" fontSize={"28px"} /> : <AiOutlineMinus color="#03c9d7" fontSize={"28px"} />}</div>
                    )
                  case "warmupAge": 
                    return (
                      <div>{`${warmupDiffDays} day(s)`}</div>
                    )
                  case "Settings":
                    return (
                      <div className="flex justify-center">
                        <CustomTooltipComponent
                          icon={AiFillSetting}
                          tooltipText="Analytics"
                          onClick={() => {
                            getAcc(props.rowData._id);
                          }}
                          currentColor={themeColorsUsable.red}
                        />
                      </div>
                    );
                  case "Stage":
                    return (
                      <div className="flex justify-center">
                        {props.rowData.inProd ? (
                          <CustomTooltipComponent
                            icon={AiFillCaretRight}
                            tooltipText="In Production"
                            onClick={() => {
                              handleOpenInProductionModal(props.rowData._id);
                            }}
                            currentColor={themeColorsUsable.green}
                            disabled={warmupDiffDays < 45}
                          />
                        ) : (
                          <CustomTooltipComponent
                            icon={AiFillFire}
                            tooltipText="In Warmup Only"
                            onClick={() => {
                              handleOpenInWarmupModal(props.rowData._id);
                            }}
                            currentColor={themeColorsUsable.red}
                            disabled={warmupDiffDays < 45 || props.rowData.inRecoveryMode}
                          />
                        )}
                      </div>
                    );
                  case "Status":
                    if (
                      !props.rowData.isLocked &&
                      !props.rowData.inRecoveryMode &&
                      !props.rowData.recoveryDone
                    ) {
                      return (
                        <div className="flex justify-center">
                          <CustomTooltipComponent
                            icon={AiFillLock}
                            tooltipText="Freeze"
                            onClick={() => handleLock(props.rowData._id)}
                            currentColor={themeColorsUsable.red}
                          />
                        </div>
                      );
                    } else if (
                      props.rowData.isLocked &&
                      !props.rowData.inRecoveryMode
                    ) {
                      return (
                        <div className="flex justify-center">
                          <CustomTooltipComponent
                            icon={AiOutlineRedo}
                            tooltipText="Turn on recovery mode"
                            onClick={() =>
                              handleOpenRecoveryModeModal(props.rowData._id)
                            }
                            currentColor={currentColor}
                          />
                        </div>
                      );
                    } else if (
                      !props.rowData.isLocked &&
                      props.rowData.inRecoveryMode
                    ) {
                      return (
                        <div className="flex justify-center">
                          <CustomTooltipComponent
                            icon={AiOutlineRetweet}
                            tooltipText="In recovery mode"
                            onClick={() =>
                              handleOpenInRecoveryModeModal(props.rowData._id)
                            }
                            currentColor={currentColor}
                          />
                        </div>
                      );
                    } else if (props.rowData.recoveryDone) {
                      return (
                        <div className="flex justify-center">
                          <CustomTooltipComponent
                            icon={AiOutlineCheck}
                            tooltipText="Recovery done"
                            onClick={() =>
                              handleOpenRecoveryDoneModal(props.rowData._id)
                            }
                            currentColor={themeColorsUsable.green}
                          />
                        </div>
                      );
                    }
                }
              },
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
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListView;
