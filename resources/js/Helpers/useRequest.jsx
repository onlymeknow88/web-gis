import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Custom Hooks for API Requests
 * Adapted for Laravel Inertia + React (Session cookie-based auth)
 */

const host = "/api/";

// Global Axios Interceptor to handle session expiration (401)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Session Auth (GET)
export function useGet() {
    const [successRes, setSuccessRes] = useState({});
    const [errorsRes, setErrorsRes] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    const req = useCallback((args = {}, endpoint = "") => {
        setLoading(true);
        setSuccessRes({});
        setErrorsRes({});
        setSuccess(false);
        setFailed(false);

        const url = `${host}${endpoint}`.replace(/\/+/g, "/");

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            params: args,
            url,
        };

        return axios(options)
            .then((res) => {
                setSuccessRes(res);
                setFailed(false);
                setSuccess(true);
                setLoading(false);
                return res;
            })
            .catch((e) => {
                setErrorsRes(e.response);
                setSuccessRes({});
                setFailed(true);
                setSuccess(false);
                setLoading(false);
                throw e;
            });
    }, []);

    const feedback = {
        success_res: successRes.data,
        error_res: errorsRes,
        loading: loading,
        success: success,
        failed: failed,
        response: successRes,
    };
    return [req, feedback];
}

// Without Authorization (GET)
export function useGetViewer() {
    const [successRes, setSuccessRes] = useState({});
    const [errorsRes, setErrorsRes] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    function req(args = {}, endpoint = "") {
        setLoading(true);
        setSuccessRes({});
        setErrorsRes({});
        setSuccess(false);
        setFailed(false);

        const url = `${host}${endpoint}`.replace(/\/+/g, "/");

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            params: args,
            url,
        };

        return axios(options)
            .then((res) => {
                setSuccessRes(res);
                setFailed(false);
                setSuccess(true);
                setLoading(false);
                return res;
            })
            .catch((e) => {
                setErrorsRes(e.response);
                setSuccessRes({});
                setFailed(true);
                setSuccess(false);
                setLoading(false);
                throw e;
            });
    }

    const feedback = {
        success_res: successRes.data,
        error_res: errorsRes,
        loading: loading,
        success: success,
        failed: failed,
        response: successRes,
    };
    return [req, feedback];
}

// Without Authorization (POST)
export function usePostViewer(endpoint = "") {
    const [successRes, setSuccessRes] = useState({});
    const [errorsRes, setErrorsRes] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    function req(args = {}) {
        setLoading(true);
        setSuccessRes({});
        setErrorsRes({});
        setSuccess(false);
        setFailed(false);

        const url = `${host}${endpoint}`.replace(/\/+/g, "/");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            data: args,
            url,
        };

        return axios(options)
            .then((res) => {
                setSuccessRes(res);
                setFailed(false);
                setSuccess(true);
                setLoading(false);
                return res;
            })
            .catch((e) => {
                setErrorsRes(e.response);
                setSuccessRes({});
                setFailed(true);
                setSuccess(false);
                setLoading(false);
                throw e;
            });
    }

    const feedback = {
        success_res: successRes.data,
        error_res: errorsRes,
        loading: loading,
        success: success,
        failed: failed,
        response: successRes,
    };
    return [req, feedback];
}

// Session Auth (POST)
export function usePost(endpoint = "") {
    const [successRes, setSuccessRes] = useState({});
    const [errorsRes, setErrorsRes] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    const req = useCallback((args = {}) => {
        setLoading(true);
        setSuccessRes({});
        setErrorsRes({});
        setSuccess(false);
        setFailed(false);

        const url = `${host}${endpoint}`.replace(/\/+/g, "/");
        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
            data: args,
            url,
        };

        return axios(options)
            .then((res) => {
                setSuccessRes(res);
                setFailed(false);
                setSuccess(true);
                setLoading(false);
                return res;
            })
            .catch((e) => {
                setErrorsRes(e.response);
                setSuccessRes({});
                setFailed(true);
                setSuccess(false);
                setLoading(false);
                throw e;
            });
    }, [endpoint]);

    const feedback = {
        success_res: successRes.data,
        error_res: errorsRes,
        loading: loading,
        success: success,
        failed: failed,
        response: successRes,
    };
    return [req, feedback];
}

// Session Auth (PUT)
export function usePut(endpoint = "") {
    const [successRes, setSuccessRes] = useState({});
    const [errorsRes, setErrorsRes] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    const req = useCallback((args = {}, id = "") => {
        setLoading(true);
        setSuccessRes({});
        setErrorsRes({});
        setSuccess(false);
        setFailed(false);

        const targetEndpoint = id ? `${endpoint}/${id}` : endpoint;
        const url = `${host}${targetEndpoint}`.replace(/\/+/g, "/");

        const options = {
            method: "PUT",
            headers: {
                Accept: "application/json",
            },
            data: args,
            url,
        };

        return axios(options)
            .then((res) => {
                setSuccessRes(res);
                setFailed(false);
                setSuccess(true);
                setLoading(false);
                return res;
            })
            .catch((e) => {
                setErrorsRes(e.response);
                setSuccessRes({});
                setFailed(true);
                setSuccess(false);
                setLoading(false);
                throw e;
            });
    }, [endpoint]);

    const feedback = {
        success_res: successRes.data,
        error_res: errorsRes,
        loading: loading,
        success: success,
        failed: failed,
        response: successRes,
    };
    return [req, feedback];
}

// Session Auth (DELETE)
export function useDelete(endpoint = "") {
    const [successRes, setSuccessRes] = useState({});
    const [errorsRes, setErrorsRes] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    const req = useCallback((id = "") => {
        setLoading(true);
        setSuccessRes({});
        setErrorsRes({});
        setSuccess(false);
        setFailed(false);

        const targetEndpoint = id ? `${endpoint}/${id}` : endpoint;
        const url = `${host}${targetEndpoint}`.replace(/\/+/g, "/");

        const options = {
            method: "DELETE",
            headers: {
                Accept: "application/json",
            },
            url,
        };

        return axios(options)
            .then((res) => {
                setSuccessRes(res);
                setFailed(false);
                setSuccess(true);
                setLoading(false);
                return res;
            })
            .catch((e) => {
                setErrorsRes(e.response);
                setSuccessRes({});
                setFailed(true);
                setSuccess(false);
                setLoading(false);
                throw e;
            });
    }, [endpoint]);

    const feedback = {
        success_res: successRes.data,
        error_res: errorsRes,
        loading: loading,
        success: success,
        failed: failed,
        response: successRes,
    };
    return [req, feedback];
}
