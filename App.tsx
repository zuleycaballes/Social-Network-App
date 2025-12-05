import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, AuthContext } from "./auth/Auth";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import UserPage from "./components/UserPage";
import PostsPage from "./components/PostsPage";
import ProfilePage from "./components/ProfilePage";
import CreatePage from "./components/CreatePage";
import FollowingPage from "./components/FollowingPage";
import FollowersList from "./components/FollowersList";
import FollowingList from "./components/FollowingList";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Following" component={FollowingPage} />
      <Tab.Screen name="Create" component={CreatePage} />
      <Tab.Screen name="Posts" component={PostsPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="UserPage" component={UserPage} />
          <Stack.Screen name="FollowersList" component={FollowersList} />
          <Stack.Screen name="FollowingList" component={FollowingList} />
          <Stack.Screen name="Posts" component={PostsPage} />
        </>
      ) : (
        <>
          <Stack.Screen name="Marina Zocial" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}