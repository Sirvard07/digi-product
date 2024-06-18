import { axiosPrivate } from "../api/axios";
import { useEffect } from 'react';
import { useStateContext } from "../contexts/ContextProvider";

const useAxiosPrivate = () => {
    const { auth } = useStateContext();

    useEffect(()=> {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth}`;
                }
                return config;
            }, (error) => {
                Promise.reject(error);
            }
        )

        const responseIntercept = axiosPrivate.interceptors.response.use( 
            response => response, async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    prevRequest.headers['Authorization'] = `Bearer ${auth}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
        });

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }

    }, [auth]);

    return axiosPrivate;
}

export default useAxiosPrivate;