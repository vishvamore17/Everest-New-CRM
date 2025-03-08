"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const GoogleProfile = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/google/session", {
          withCredentials: true,
        });

        if (response.data.user) {
          setUser(response.data.user);
        } else {
          router.push("/"); // Redirect to home if not authenticated
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/");
      }
    };

    fetchUserData();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Google Profile</h1>
      <div style={{ marginTop: "20px" }}>
        <img
          src={user.image || "https://via.placeholder.com/150"}
          alt="Profile"
          style={{ width: "150px", borderRadius: "50%" }}
        />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>{user.isFirstLogin ? "First Login" : "Welcome Back!"}</p>
      </div>
      <button
        onClick={async () => {
          await axios.get("http://localhost:8000/logout", { withCredentials: true });
          router.push("/"); // Redirect after logout
        }}
        style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
};

export default GoogleProfile;
