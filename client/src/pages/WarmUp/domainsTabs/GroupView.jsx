import {
  Alert,
  Box,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Typography,
  Autocomplete,
  TextField,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CustomLoadingIndicator,
  CustomModal,
  CustomTooltipComponent,
} from "../../../components";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { MdAdd, MdDelete } from "react-icons/md";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import "ka-table/style.css";
import { themeColorsUsable } from "../../../data/buildData";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { AiFillLock, AiFillSetting, AiOutlineRedo, AiOutlineRetweet, AiOutlineCheck, AiFillCaretRight, AiFillFire, AiFillCheckCircle, AiOutlineMinus } from "react-icons/ai";

const GroupView = () => {
  const {
    currentColor,
    loadingIndicatorActive,
    setLoadingIndicatorActive,
    loggedIn,
  } = useStateContext();

  const navigate = useNavigate();

  const axiosPrivate = useAxiosPrivate();

  const [domainsAsOptions, setDomainsAsOptions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [warmupGroups, setWarmupGroups] = useState([]);
  const [allWarmupGroups, setAllWarmupGroups] = useState([]);
  const [selectedDomainsIds, setSelectedDomainsIds] = useState([]);
  const [selectedGroupDomainsIds, setSelectedGroupDomainsIds] = useState([]);
  const [selectedWarmupGroups, setSelectedWarmupGroups] = useState([]);
  const [groupDomainsAsOptions, setGroupDomainsAsOptions] = useState([]);
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false);
  const [openAddDomainsToGroupModal, setOpenAddDomainsToGroupModal] =
    useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [openAnalytics, setOpenAnalytics] = useState(false);
  const [openRate, setOpenRate] = useState(0);
  const [replyRate, setReplyRate] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [domainId, setDomainId] = useState(null);
  const [recoveryModeSelectedDay, setRecoveryModeSelectedDay] = useState([]);
  const [recoveryModeDay, setRecoveryModeDay] = useState(null);
  const [selectedRecoveryModeDayLimit, setSelectedRecoveryModeDayLimit] = useState(null);
  const [recoveryModeDayLimitDays, setRecoveryModeDayLimitDays] = useState([]);
  const [dayOnRecoveryMode, setDayOnRecoveryMode] = useState(0);
  const [openLockDomainModal, setOpenLockDomainModal] = useState(false);
  const [openRecoveryModeModal, setOpenRecoveryModeModal] = useState(false);
  const [openInRecoveryModeModal, setOpenInRecoveryModeModal] = useState(false);
  const [openRecoveryDoneModal, setOpenRecoveryDoneModal] = useState(false);
  const [openInProductionModal, setOpenInProductionModal] = useState(false);
  const [openInWarmupModal, setOpenInWarmupModal] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

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
          setSelectedRecoveryModeDayLimit(e.target.value);
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
    }
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

  const elementsCreateGroupModal = [
    {
      type: "title",
      props: {
        label: "Create new group",
      },
    },
    {
      type: "select",
      props: {
        label: "Choose domains",
        name: "Choose domains",
        value: selectedDomainsIds,
        onChange: (e) => {
          setSelectedDomainsIds(
            typeof e.target.value === "string"
              ? e.target.value.split(",")
              : e.target.value
          );
        },
        renderValue: (selected) => {
          const selectedDomains = domainsAsOptions
            .filter((item) => selected.includes(item.value))
            .map((item) => item.label);
          return selectedDomains.join(", ");
        },
        required: true,
        multiple: true,
      },
      options: domainsAsOptions,
    },
  ];

  const elementsAddDomainsToGroupModal = [
    {
      type: "title",
      props: {
        label: `Add domains to ${editingGroup?.name || "group"}`,
      },
    },
    {
      type: "select",
      props: {
        label: "Choose domains",
        name: "Choose domains",
        value: selectedGroupDomainsIds,
        onChange: (e) => {
          setSelectedGroupDomainsIds(
            typeof e.target.value === "string"
              ? e.target.value.split(",")
              : e.target.value
          );
        },
        renderValue: (selected) => {
          const selectedDomains = groupDomainsAsOptions
            .filter((item) => selected.includes(item.value))
            .map((item) => item.label);
          return selectedDomains.join(", ");
        },
        required: true,
        multiple: true,
      },
      options: groupDomainsAsOptions,
    },
  ];

  const handleCreateGroup = async () => {
    setLoadingIndicatorActive(true);
    try {
      if (selectedDomainsIds.length) {
        const response = await axiosPrivate.post(
          `/api/v1/warmup/warmup-group/create`,
          {
            selectedDomainsIds,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data?.success) {
          setSnackbarMessage(response.data.message);
          setShowSnackbar(true);
          setSnackbarSeverity("success");
          setSelectedDomainsIds([]);
          setOpenCreateGroupModal(false);
          if (selectedWarmupGroups.length) {
            getWarmupGroupsByIds(selectedWarmupGroups);
          } else {
            getWarmupGroups();
          }
          getAllWarmupGroups();
        } else {
          setSnackbarMessage(response.data.message);
          setShowSnackbar(true);
          setSnackbarSeverity("error");
        }
      } else {
        setSnackbarMessage("Please choose at least one domain.");
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const getWarmupGroups = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-group/get`,
        {
          page,
          limit,
          sortField: "createdAt",
          sortOrder: "desc",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response?.data?.success) {
        response?.data?.data.sort((a, b) => {
          if (a.priority === b.priority) {
              return 0;
          } else if (a.priority) {
              return -1;
          } else {
              return 1;
          }
        });
        setWarmupGroups(response?.data?.data);
        setTotalPages(Math.ceil(response?.data?.total / limit));
        if (!response?.data?.data.length) {
          setPage(1);
        }
        getAllDomains();
      } else {
        setSnackbarMessage(response?.data?.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const getWarmupGroupsByIds = async (groups) => {
    const warmupGroupsIds = groups.map((g) => g.id);
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-group/getByIds`,
        {
          warmupGroupsIds,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response?.data?.success) {
        response?.data?.data.sort((a, b) => {
          if (a.priority === b.priority) {
              return 0;
          } else if (a.priority) {
              return -1;
          } else {
              return 1;
          }
        });
        setWarmupGroups(response?.data?.data);
        setTotalPages(1);
        setPage(1);
        getAllDomains();
      } else {
        setSnackbarMessage(response?.data?.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const getAllWarmupGroups = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-group/get`,
        {
          sortField: "createdAt",
          sortOrder: "desc",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response?.data?.success) {
        response?.data?.data.sort((a, b) => {
          if (a.priority === b.priority) {
              return 0;
          } else if (a.priority) {
              return -1;
          } else {
              return 1;
          }
        });
        const transformedGroups = response?.data?.data.map((item) => ({
          id: item._id,
          label: item.name,
        }));
        setAllWarmupGroups(transformedGroups);
      } else {
        setSnackbarMessage(response?.data?.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleAddDomainsToGroup = async () => {
    setLoadingIndicatorActive(true);
    try {
      if (selectedGroupDomainsIds.length) {
        const group = warmupGroups.find((g) => g._id === editingGroup._id);
        const filteredDomainsIds = group.domains.map((d) => d._id);
        selectedGroupDomainsIds.forEach((domainId) => {
          filteredDomainsIds.push(domainId);
        });
        const response = await axiosPrivate.post(
          `/api/v1/warmup/warmup-group/update`,
          {
            groupId: group._id,
            domains: selectedGroupDomainsIds,
            action: "add"
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data?.success) {
          setSnackbarMessage(response.data.message);
          setShowSnackbar(true);
          setSnackbarSeverity("success");
          setEditingGroup(null);
          setSelectedGroupDomainsIds([]);
          setOpenAddDomainsToGroupModal(false);
          if (selectedWarmupGroups.length) {
            getWarmupGroupsByIds(selectedWarmupGroups);
          } else {
            getWarmupGroups();
          }
        } else {
          setSnackbarMessage(response.data.message);
          setShowSnackbar(true);
          setSnackbarSeverity("error");
        }
      } else {
        setSnackbarMessage("Please choose at least one domain.");
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const removeDomainFromGroup = async (groupId, domainId) => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-group/update`,
        {
          groupId,
          domains: [domainId],
          action: "remove"
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data?.success) {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
      } else {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const addDomainToGroup = async (groupId) => {
    const group = warmupGroups.find((g) => g._id === groupId);
    setEditingGroup(group);
    const availableDomains = [];
    domainsAsOptions.map((domain) => {
      if (!group.domains.map((d) => d._id).includes(domain.value)) {
        availableDomains.push(domain);
      }
    });
    if (availableDomains.length) {
      setGroupDomainsAsOptions(availableDomains);
      setOpenAddDomainsToGroupModal(true);
    } else {
      setSnackbarMessage(`${group.name} already includes all domains.`);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    }
  };

  const deleteGroup = async (groupId) => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-group/delete`,
        {
          groupId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data?.success) {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
      } else {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const updateGroups = async (groupId, domains, action) => {
    try {
      setLoadingIndicatorActive(true);
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-group/update`,
        {
          groupId,
          domains,
          action
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data?.success) {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleOpenInProductionModal = (id) => {
    setDomainId(id);
    setOpenInProductionModal(true);
  }
  
  const handleOpenInWarmupModal = (id) => {
    setDomainId(id);
    setOpenInWarmupModal(true);
  }

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    if (
      result.destination.droppableId === result.source.droppableId &&
      result.source.index === result.destination.index
    ) {
      return;
    }

    if (result.destination.droppableId === result.source.droppableId) {
      const cloneWarmupGroups = [...warmupGroups];
      const groupIndex = cloneWarmupGroups.findIndex(
        (g) => g._id === result.destination.droppableId
      );
      const domains = reorder(
        cloneWarmupGroups[groupIndex].domains,
        result.source.index,
        result.destination.index
      );
      cloneWarmupGroups[groupIndex].domains = domains;
      await updateGroups(
        cloneWarmupGroups[groupIndex]._id,
        cloneWarmupGroups[groupIndex].domains.map(domain => domain._id),
        "update"
      );
      if (selectedWarmupGroups.length) {
        getWarmupGroupsByIds(selectedWarmupGroups);
      } else {
        await getWarmupGroups();
      }
    } else {
      const cloneWarmupGroups = [...warmupGroups];
      const sourceGroupIndex = cloneWarmupGroups.findIndex(
        (g) => g._id === result.source.droppableId
      );
      const destinationGroupIndex = cloneWarmupGroups.findIndex(
        (g) => g._id === result.destination.droppableId
      );
      const destinationGroup = cloneWarmupGroups.find(
        (g) => g._id === result.destination.droppableId
      );
      const draggableId = result.draggableId.split("-")[1];
      const domainExists = destinationGroup.domains.find(
        (d) => d._id === draggableId
      );
      if (domainExists) {
        setSnackbarMessage(
          `This domain already exists in ${destinationGroup.name}`
        );
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      } else {
        const domainToAdd = cloneWarmupGroups[sourceGroupIndex].domains.find(
          (d) => d._id === draggableId
        );
        cloneWarmupGroups[sourceGroupIndex].domains = cloneWarmupGroups[
          sourceGroupIndex
        ].domains.filter((d) => d._id !== draggableId);
        cloneWarmupGroups[destinationGroupIndex].domains.splice(
          result.destination.index,
          0,
          domainToAdd
        );
        await updateGroups(
          cloneWarmupGroups[sourceGroupIndex]._id,
          [draggableId],
          "remove"
        );
        await updateGroups(
          cloneWarmupGroups[destinationGroupIndex]._id,
          [domainToAdd._id],
          "add"
        );
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          await getWarmupGroups();
        }
      }
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleEditGroupName = async (group) => {
    setEditingGroupId(group._id);
    setEditingGroupName(group.name);
  };

  const handleKeyDown = async (e) => {
    if (e.code === "Enter") {
      try {
        setLoadingIndicatorActive(true);
        const response = await axiosPrivate.post(
          `/api/v1/warmup/warmup-group/update`,
          {
            groupId: editingGroupId,
            name: editingGroupName,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data?.success) {
          setSnackbarMessage(response.data.message);
          setShowSnackbar(true);
          setSnackbarSeverity("success");
          setEditingGroupId(null);
          setEditingGroupName("");
          if (selectedWarmupGroups.length) {
            getWarmupGroupsByIds(selectedWarmupGroups);
          } else {
            getWarmupGroups();
          }
        } else {
          setSnackbarMessage(response.data.message);
          setShowSnackbar(true);
          setSnackbarSeverity("error");
        }
      } catch (error) {
        setSnackbarMessage(error?.response?.data?.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      } finally {
        setLoadingIndicatorActive(false);
      }
    }
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
        setDomainId(id);
        setOpenRate(data.data.payload.warmup.advanced?.open_rate || 0);
        setReplyRate(data.data.payload.warmup.reply_rate || 0);
        setDailyLimit(data.data.payload.warmup.limit);
      } else {
        setSnackbarMessage(data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleAnalytics = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/update_Analytics`,
        {
          id: domainId,
          openRate: openRate,
          replyRate: replyRate,
          dailyLimit: dailyLimit,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      handleCloaseAnalytics();
    }
  };

  const lockDomain = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/lock`,
        {
          id: domainId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
    setOpenLockDomainModal(false);
    setDomainId(null);
  };

  const handleRecoveryMode = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/recovery-mode`,
        {
          id: domainId,
          recoveryModeDay: recoveryModeDay,
          recoveryModeDayLimitDay: selectedRecoveryModeDayLimit,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      handleCloaseRecoveryModeModal();
      setDomainId(null);
    }
  };

  const handleInRecoveryMode = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/end-recovery-mode`,
        {
          id: domainId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      handleCloseInRecoveryModeModal();
      setDomainId(null);
    }
  };

  const handleLock = (id) => {
    setDomainId(id);
    setOpenLockDomainModal(true);
  };

  const handleOpenRecoveryModeModal = (groupId, domainId) => {
    const group = warmupGroups.find((g) => g._id === groupId);
    const domain = group.domains.find((item) => item._id === domainId);
    const days = [];
    for (let day = domain.currentWarmupDay; day >= 0; day--) {
      days.push({
        label: day,
        value: day,
      });
    }
    setDomainId(domainId);
    setRecoveryModeSelectedDay(days);
    setRecoveryModeDay(days[0].value);
    setOpenRecoveryModeModal(true);
  };

  const handleOpenInRecoveryModeModal = (groupId, domainId) => {
    const group = warmupGroups.find((g) => g._id === groupId);
    const domain = group.domains.find((item) => item._id === domainId);
    setDomainId(domainId);
    setDayOnRecoveryMode(domain.recoveryModeDayLimit);
    setOpenInRecoveryModeModal(true);
  };

  const handleOpenRecoveryDoneModal = (id) => {
    setDomainId(id);
    setOpenRecoveryDoneModal(true);
  };

  const handleRemoveFromProd = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/remove-from-prod`,
        {
          id: domainId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
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
    setDomainId(null);
  } 

  const handleAddToProd = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/add-to-prod`,
        {
          id: domainId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        if (selectedWarmupGroups.length) {
          getWarmupGroupsByIds(selectedWarmupGroups);
        } else {
          getWarmupGroups();
        }
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
    setDomainId(null);
  } 

  const handleCloaseAnalytics = () => {
    setOpenAnalytics(false);
    setDomainId(null);
    setOpenRate(0);
    setReplyRate(0);
    setDailyLimit(0);
  };

  const handleCloseLockDomainModal = () => {
    setOpenLockDomainModal(false);
  };

  const handleCloaseRecoveryModeModal = () => {
    setRecoveryModeSelectedDay([]);
    setRecoveryModeDay("");
    setOpenRecoveryModeModal(false);
    setDomainId(null);
  };

  const handleCloseInRecoveryModeModal = () => {
    setOpenInRecoveryModeModal(false);
    setDomainId(null);
  };

  const handleCloseRecoveryDoneModal = () => {
    setOpenRecoveryDoneModal(false);
    setDomainId(null);
  };

  const handleCloseInProductionModal = () => {
    setDomainId(null);
    setOpenInProductionModal(false);
  }

  const handleCloseInWarmupModal = () => {
    setDomainId(null);
    setOpenInWarmupModal(false);
  }

  const getAllDomains = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.get(
        `/api/v1/warmup/domains/getAll`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        const tempDomainsArr = [];
        response.data.data.forEach((domain) => {
          if(!domain?.group) {            
            tempDomainsArr.push({
              label: domain.domainName,
              value: domain._id,
            });
          }
        });
        setDomainsAsOptions(tempDomainsArr);
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
      setSelectedRecoveryModeDayLimit(days[0].value);
      if (selectedWarmupGroups.length) {
        getWarmupGroupsByIds(selectedWarmupGroups);
      } else {
        getWarmupGroups();
      }
    } else {
      navigate("/login");
    }
  }, [page, limit, loggedIn]);

  useEffect(() => {
    getAllWarmupGroups();
  }, []);

  useEffect(() => {
    if (selectedWarmupGroups.length) {
      getWarmupGroupsByIds(selectedWarmupGroups);
    } else {
      getWarmupGroups();
    }
  }, [selectedWarmupGroups]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        <Box>
          <Autocomplete
            multiple
            id="groups-list"
            options={allWarmupGroups}
            disableCloseOnSelect
            sx={{ width: 300 }}
            onChange={(event, values) => {
              setSelectedWarmupGroups(values);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label="Choose groups"
                placeholder="Groups"
              />
            )}
          />
        </Box>
        <CustomTooltipComponent
          icon={MdAdd}
          tooltipText="Create New Group"
          onClick={() => setOpenCreateGroupModal(true)}
          currentColor={currentColor}
        />
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        {warmupGroups.length ? (
          warmupGroups.map((group) => {
            return (
              <Box key={group._id} sx={{ marginBottom: "50px" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  {editingGroupId && editingGroupId === group._id ? (
                    <TextField
                      value={editingGroupName}
                      autoFocus
                      onBlur={() => setEditingGroupId(null)}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <Typography
                      variant="h5"
                      gutterBottom
                      onDoubleClick={() => !group.priority && handleEditGroupName(group)}
                      color={group.priority ? themeColorsUsable.red : "black"}
                    >
                      {group.name}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "20px",
                    }}
                  >
                    <CustomTooltipComponent
                      icon={MdAdd}
                      tooltipText="Add a domain"
                      onClick={() => addDomainToGroup(group._id)}
                      currentColor={currentColor}
                    />
                    {!group.priority ?
                      <CustomTooltipComponent
                        icon={MdDelete}
                        tooltipText="Delete group"
                        onClick={() => deleteGroup(group._id)}
                        currentColor={themeColorsUsable.red}
                      /> : null
                    }
                  </Box>
                </Box>
                <table id="groupDomainsTable">
                  <thead>
                    <tr>
                      <th>Domain Name</th>
                      <th>cPanel Account</th>
                      <th>IP Address</th>
                      <th>Number Of Email Accounts</th>
                      <th>Current Warmup Day</th>
                      <th>First Warmup Done</th>
                      <th>Warm up start date</th>
                      <th>Warmup Age</th>
                      <th>Recovery start date</th>
                      <th>Recovery past days</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <Droppable droppableId={group._id}>
                    {(provided, snapshot) => (
                      <tbody
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {group.domains.map((domain, index) => {
                          const currentDate = new Date();

                          const dateConnectedToInstantly = new Date(
                            domain.dateConnectedToInstantly
                          );
                          const warmupDiffTime = Math.abs(
                            currentDate - dateConnectedToInstantly
                          );
                          const warmupDiffDays = Math.round(
                            warmupDiffTime / (1000 * 60 * 60 * 24)
                          );
          
                          let recoveryDiffDays = null;
          
                          if(domain.recoveryStartDate) {
                            const recoveryStartDate = new Date(
                              domain.recoveryStartDate
                            );
                            const recoveryDiffTime = Math.abs(
                              currentDate - recoveryStartDate
                            );
                            recoveryDiffDays = Math.round(
                              recoveryDiffTime / (1000 * 60 * 60 * 24)
                            );
                          }

                          return (
                            <Draggable
                              key={domain._id}
                              draggableId={group._id + "-" + domain._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <td>{domain.domainName}</td>
                                  <td>{domain.cPanelAccountName}</td>
                                  <td>{domain.ipAddress}</td>
                                  <td>{domain.numberOfEmailAccounts}</td>
                                  <td>{domain.currentWarmupDay}</td>
                                  <td className="flex justify-center">{warmupDiffDays > 45 ? <AiOutlineCheck color="#1cab1c" fontSize={"28px"} /> : <AiOutlineMinus color="#03c9d7" fontSize={"28px"} />}</td>
                                  <td>{domain.dateConnectedToInstantly?.split("T")[0] || "-"}</td>
                                  <td>{`${warmupDiffDays} days`}</td>
                                  <td>{domain.recoveryStartDate?.split("T")[0] || "-"}</td>
                                  <td>{recoveryDiffDays !== null ? `${recoveryDiffDays} day(s)` : "-"}</td>
                                  <td>
                                    <div className="flex">
                                      {domain.inProd ? (
                                        <CustomTooltipComponent
                                          icon={AiFillCaretRight}
                                          tooltipText="In Production"
                                          onClick={() => {
                                            handleOpenInProductionModal(domain._id);
                                          }}
                                          currentColor={themeColorsUsable.green}
                                          disabled={warmupDiffDays < 45}
                                        />
                                      ) : (
                                        <CustomTooltipComponent
                                          icon={AiFillFire}
                                          tooltipText="In Warmup Only"
                                          onClick={() => {
                                            handleOpenInWarmupModal(domain._id);
                                          }}
                                          currentColor={themeColorsUsable.red}
                                          disabled={warmupDiffDays < 45 || domain.inRecoveryMode}
                                        />
                                      )}
                                      <CustomTooltipComponent
                                        icon={MdDelete}
                                        tooltipText="Remove domain"
                                        onClick={() => {
                                          removeDomainFromGroup(
                                            group._id,
                                            domain._id
                                          );
                                        }}
                                        currentColor={themeColorsUsable.red}
                                      />
                                      {!domain.isLocked &&
                                      !domain.inRecoveryMode && !domain.recoveryDone ? (
                                        <CustomTooltipComponent
                                          icon={AiFillLock}
                                          tooltipText="Freeze"
                                          onClick={() => handleLock(domain._id)}
                                          currentColor={themeColorsUsable.red}
                                        />
                                      ) : domain.isLocked &&
                                        !domain.inRecoveryMode ? (
                                        <CustomTooltipComponent
                                          icon={AiOutlineRedo}
                                          tooltipText="Turn on recovery mode"
                                          onClick={() =>
                                            handleOpenRecoveryModeModal(
                                              group._id,
                                              domain._id
                                            )
                                          }
                                          currentColor={currentColor}
                                        />
                                      ) : !domain.isLocked &&
                                        domain.inRecoveryMode ? (
                                        <CustomTooltipComponent
                                          icon={AiOutlineRetweet}
                                          tooltipText="In recovery mode"
                                          onClick={() =>
                                            handleOpenInRecoveryModeModal(
                                              group._id,
                                              domain._id
                                            )
                                          }
                                          currentColor={currentColor}
                                        />
                                      ) : domain.recoveryDone ? (
                                          <CustomTooltipComponent
                                            icon={AiOutlineCheck}
                                            tooltipText="Recovery done"
                                            onClick={() =>
                                              handleOpenRecoveryDoneModal(domain._id)
                                            }
                                            currentColor={themeColorsUsable.green}
                                          />
                                      ) : null}
                                      <CustomTooltipComponent
                                        icon={AiFillSetting}
                                        tooltipText="Analytics"
                                        onClick={() => {
                                          getAcc(domain._id);
                                        }}
                                        currentColor={themeColorsUsable.red}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </table>
              </Box>
            );
          })
        ) : (
          <Box sx={{ textAlign: "center" }}>No Groups Found</Box>
        )}
      </DragDropContext>
      {warmupGroups.length ? (
        <div className="flex justify-between items-center my-4">
          <Select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(e.target.value);
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
            onChange={(event, newPage) => setPage(newPage)}
          />
        </div>
      ) : null}
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
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />
      <CustomModal
        open={openCreateGroupModal}
        handleClose={() => setOpenCreateGroupModal(false)}
        elements={elementsCreateGroupModal}
        confirmFunction={handleCreateGroup}
      />
      <CustomModal
        open={openAddDomainsToGroupModal}
        handleClose={() => {
          setOpenAddDomainsToGroupModal(false);
          setSelectedGroupDomainsIds([]);
          setEditingGroup(null);
        }}
        elements={elementsAddDomainsToGroupModal}
        confirmFunction={handleAddDomainsToGroup}
      />
      <CustomModal
        open={openAnalytics}
        handleClose={handleCloaseAnalytics}
        elements={elementsAnalyticsModal}
        confirmFunction={handleAnalytics}
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
        handleClose={handleCloseInRecoveryModeModal}
        elements={elementsInRecoveryModeModal}
        confirmFunction={handleInRecoveryMode}
      />
      <CustomModal
        open={openRecoveryDoneModal}
        handleClose={handleCloseRecoveryDoneModal}
        elements={elementsRecoveryDoneModal}
        confirmFunction={() => { setOpenRecoveryDoneModal(false); setOpenLockDomainModal(true) }}
        confirmText={'Freeze'}
        additionalConfirmFunction={handleAddToProd}
        additionalConfirmText={'Move to Prod'}
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
    </Box>
  );
};

export default GroupView;
