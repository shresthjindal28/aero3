import { io } from "socket.io-client";

// later will add to fetch this from DB based on doctor login
const DOCTORID = "DOCT-000001";

const URL = "http://localhost:3500";

export const socket = io(URL, {
  query: {
    doctorId: DOCTORID,
  },
});
