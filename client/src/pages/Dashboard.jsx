import React, { useEffect, useState }  from 'react';
import { BsListUl } from 'react-icons/bs';
import { MdDomain } from 'react-icons/md';

import { useStateContext } from '../contexts/ContextProvider';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const Dashboard = () => {
  const { loggedIn } = useStateContext();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  let [dashboardData, setDashboardData] = useState({});

  const getDashboardData = async () => {
    try {
      let dashboardResponse = await axiosPrivate.post('/api/v1/dashboard/get',{});
      console.log(dashboardResponse.data);
      if (dashboardResponse.data.success){
        setDashboardData(dashboardResponse.data.data);
      }
    } catch(err){
        if (!err?.response){
            console.log(err.response);
        } else if (err.response?.status === 400){
  
        } else if (err.response?.status === 401){
  
        } else if (err.response?.status === 500){
  
        } else {
  
        }
    }
  }

  useEffect(() => {
    if (loggedIn) {
        getDashboardData();
    } else {
        navigate("/login");
    }
  }, [loggedIn]);

  return (
    <div className="mt-24">
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="flex m-3 flex-wrap justify-center gap-1 items-stretch">

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl">
            <button
              type="button"
              style={{ color: "#03C9D7", backgroundColor: "#E5FAFB" }}
              className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
            >
              <MdDomain />
            </button>
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <p className="mt-3">
                  <span className="text-lg font-semibold">{dashboardData.totalDomains}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">Total Domains</p>
              </div>
              <div>
                <p className="mt-3">
                  <span className="text-lg font-semibold">{dashboardData.completeDomains}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">Complete Domains</p>
              </div>
              <div>
                <p className="mt-3">
                  <span className="text-lg font-semibold">{dashboardData.notCompleteDomains}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">Not Complete Domains</p>
              </div>
            </div>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl">
          <button
            type="button"
            style={{ color: "#03C9D7", backgroundColor: "#E5FAFB" }}
            className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
          >
            <BsListUl />
          </button>
          <div className="flex flex-col justify-between flex-grow">
            <div>
              <p className="mt-3">
                <span className="text-lg font-semibold">{dashboardData.totalCPanelAccounts}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">cPanel Accounts</p>
            </div>
          </div>
        </div>
          

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
