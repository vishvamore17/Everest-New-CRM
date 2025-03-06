"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MdCancel } from "react-icons/md";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/ModeToggle"
import { Meteors } from "@/components/ui/meteors";


interface Task {
  _id: string;
  subject:string;
  relatedTo:string;
  lastReminder:string;
  name:string;
  assigned:string;
  taskDate:string;
  dueDate:string;
  status:"Pending" | "In Progress" | "Resolved" ;
  isActive: boolean;
}

const getAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/task/getAllTasks");
    const data = await response.json();
    if (data.success) return data.data;
    throw new Error(data.message);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
};

export default function App() {
  const [error, setError] = useState("");
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getAllTasks();
        groupTasksByStatus(fetchedTasks);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message); // TypeScript now recognizes 'message'
        } else {
          setError("An unknown error occurred");
      }
    };
  }
    fetchTasks();
  }, []);

  const groupTasksByStatus = (tasks: Task[]) => {
    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    setGroupedTasks(grouped);
  };


  const statusColors: Record<string, string> = {
    Pending: "bg-purple-200 text-gray-800 border-2 border-purple-900 shadow-lg shadow-purple-900/50",
    "In Progress": "bg-purple-200 text-gray-800 border-2 border-purple-900 shadow-lg shadow-purple-900/50",
    Resolved: "bg-purple-200 text-gray-800 border-2 border-purple-900 shadow-lg shadow-purple-900/50",
  };
  

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

    const handleDragStart = (e: React.DragEvent, task: Task, fromStatus: string) => {
      e.dataTransfer.setData("task", JSON.stringify(task));
      e.dataTransfer.setData("fromStatus", fromStatus);
      e.dataTransfer.effectAllowed = "move";
    };

     const handleDrop = async (e: React.DragEvent, toStatus: string) => {
        e.preventDefault();
        setDraggedOver(null);
        const taskData = e.dataTransfer.getData("task");
        const fromStatus = e.dataTransfer.getData("fromStatus");
    
        if (!taskData || !fromStatus || fromStatus === toStatus) return;
    
        const task: Task = JSON.parse(taskData);
        const updatedTask = { ...task, status: toStatus };
    
        setGroupedTasks((prev) => ({
          ...prev,
          [fromStatus]: prev[fromStatus]?.filter((l) => l._id !== task._id) || [],
          [toStatus]: [...(prev[toStatus] || []), updatedTask as Task], 
        }));
        
        try {
          const response = await fetch("http://localhost:8000/api/v1/task/updateTaskStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: task._id, status: toStatus }),
          });
          const data = await response.json();
          if (!data.success) throw new Error("Failed to update task status on server.");
        } catch (error) {
          console.error("Error updating status:", error);
        }
      };

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <SidebarInset>
        <header className="flex h-14 md:h-12 items-center px-4 w-full border-b shadow-sm">
        <SidebarTrigger className="mr-2" />
          <ModeToggle/>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Breadcrumb>
              <BreadcrumbList className="flex items-center space-x-2">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Drag & Drop</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
        </SidebarInset>

        <div className="p-6 ">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl md:max-w-4xl mx-auto">
          {Object.keys(statusColors).map((status) => {
              const taskStatus = groupedTasks[status] || [];

              return (
                <div
                  key={status}
                  className={`p-4  min-h-[300px] transition-all w-full border ${draggedOver === status ? "border-gray-500 border-dashed" : "border-transparent"}`}
                  onDrop={(e) => handleDrop(e, status)}

                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggedOver(status);
                  }}
                  onDragLeave={() => setDraggedOver(null)}
                >
                  <h2 className={`text-sm font-bold mb-4 px-5 py-2 rounded-lg ${statusColors[status]}`}>{status}</h2>
                  <div className="p-3 bg-[#FAF3DD] rounded-md shadow">
                    <p className="text-sm font-semibold text-black">Total Task: {taskStatus.length}</p>
                  </div>

                  <div className="mt-4 space-y-3 min-h-[250px] max-h-[500px] overflow-auto">
                    {taskStatus.length === 0 ? (
                      <p className="text-gray-500 text-center">No tasks available</p>
                    ) : (
                      taskStatus.map((task) => (
                        <div
                          key={task._id}
                          className="border border-gray-300 rounded-lg shadow-md bg-white p-3 cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task, status)}
                          onClick={() => handleTaskClick(task)}
                        >
                          <p className="text-sm font-semibold text-black">Subject: {task.subject}</p>
                          
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {isModalOpen && selectedTask && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-lg relative">
                {/* Meteor Effect Background */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] rounded-full blur-3xl" />

                {/* Modal Content */}
                <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-6 py-8 rounded-2xl">
                  {/* Close Button */}
                  <div
                    className="absolute top-3 right-3 h-8 w-8 rounded-full border border-gray-500 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setIsModalOpen(false); // Close Modal
                    }}
                  >
                    <MdCancel className="text-white text-2xl"/>
                      
                  </div>

                  {/* Title */}
                  <h1 className="font-bold text-2xl text-white mb-6 text-center">Lead Details</h1>

                  {/* Lead Details in Two Columns */}
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {Object.entries(selectedTask)
                      .filter(([key]) => !["_id", "isActive", "createdAt", "updatedAt"].includes(key))
                      .map(([key, value]) => (
                        <p key={key} className="text-sm">
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                          {["date", "endDate"].includes(key) && value
                            ? new Date(value).toLocaleDateString()
                            : value || "N/A"}
                        </p>
                      ))}
                  </div>

                  {/* Meteor Effect */}
                  <Meteors number={20} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
} 