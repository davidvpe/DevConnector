import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

//Register User
import { GET_ERRORS, SET_CURRENT_USER } from './types';

export const registerUser = (userData, history) => dispatch => {
    axios
        .post('/api/users/register', userData)
        .then(result => {
            history.push('/login');
        })
        .catch(err =>
            dispatch({ type: GET_ERRORS, payload: err.response.data })
        );
};

//Login - Get User Token

export const loginUser = userData => dispatch => {
    axios
        .post('/api/users/login', userData)
        .then(res => {
            const { token } = res.data;
            // Save in local storage
            localStorage.setItem('jwtToken', token);
            // Set token to auth header
            setAuthToken(token);
            //Decode user data from jwt token
            const decoded = jwt_decode(token);
            //Set the current user
            dispatch(setCurrentUser(decoded));
        })
        .catch(err =>
            dispatch({ type: GET_ERRORS, payload: err.response.data })
        );
};

export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
    };
};

export const logoutUser = () => dispatch => {
    localStorage.removeItem('jwtToken');
    //Remove the auth header for future requests
    setAuthToken(false);
    //Set current user to empty object and isAuthenticated to false
    dispatch(setCurrentUser({}));
};
