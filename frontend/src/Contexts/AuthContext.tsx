import { createContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  State,
  Action,
  ChildrenProps,
  AuthContextType,
} from "../Models/AuthModels";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoginLoading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    case "toggleLoading":
      return { ...state, isLoginLoading: !state.isLoginLoading };
    default:
      throw new Error("unknown action");
  }
}
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  logout: () => {},
  createUser: async () => {},
  loadingToggle: () => {},
});
function AuthProvider({ children }: ChildrenProps) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated, isLoginLoading } = state;

  async function login(user: User) {
    dispatch({ type: "toggleLoading" });
    const data = await dbIsValidUser(user);
    console.log(data);
    dispatch({ type: "toggleLoading" });
    if (data?.status === "success") {
      dispatch({
        type: "login",
        payload: {
          email: user.email,
          password: user.password,
          username: data.username,
        },
      });

      alert("Successfully logged in!");
    } else {
      alert(data.message);
    }
  }
  async function createUser(newUser: User) {
    dispatch({ type: "toggleLoading" });
    const data = await dbPostUser(newUser);
    dispatch({ type: "toggleLoading" });
    if (data?.status === "success") {
      alert("Successfully created user! Please login.");
      navigate("/login");
    } else {
      alert(data.message);
    }
  }

  function logout() {
    dispatch({ type: "logout" });
    dispatch({ type: "toggleLoading" });
  }

  function loadingToggle() {
    dispatch({ type: "toggleLoading" });
  }

  async function dbIsValidUser(user: User) {
    try {
      const res = await fetch(`http://localhost:8000/auth/login`, {
        method: "post",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log(data);
      return data;
    } catch {
      alert("There was an error validating user...");
    }
  }

  async function dbPostUser(newUser: User) {
    try {
      const res = await fetch(`http://localhost:8000/auth/signup`, {
        method: "post",
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log(data);
      return data;
    } catch {
      alert("There was an error loading data...");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        createUser,
        isLoginLoading,
        loadingToggle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
