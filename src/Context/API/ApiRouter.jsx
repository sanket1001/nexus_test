// Use environment variable for API URL, fallback to localhost for development
export const host = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";

// Auth Routes
export const loginurl = "auth/login";
export const signupurl = "auth/create-account";
export const userinfo = "auth/user-info";
export const verifyusertype = "auth/verifyusertype";

// Usertype Routes
export const usertype = "usertype/";

// building Routes
export const buildingurl = "building/";

// rooms Routes
export const getroomurl = "room?BID=";
export const addroomurl = "room/";

//organization Routes
export const organizationurl = "organization/";

//events Routes
export const eventurl = "event/";

//posts Routes
export const posturl = "post/";
export const userblogurl = "userblog/";
export const adminblogurl = "adminblogurl/";

//useractivity Routes
export const academiclevel= "useractivities/academic-level/";
export const major= "useractivities/major/";
