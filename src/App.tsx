import { useEffect } from "react";
import { AppRoutes } from "./routes/app-routes";
import { useAppDispatch } from "./store/hooks";
import { authService } from "./features/auth/services/authService";
import { setAuthFailed, setCredentials } from "./features/auth/store/authSlice";

function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await authService.getMe();
                dispatch(setCredentials({ user: response.data.user }));
            } catch (error) {
                dispatch(setAuthFailed());
            }
        };

        checkSession();
    }, [dispatch]);
    
    return <AppRoutes />;
}

export default App;