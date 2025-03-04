"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/ModeToggle"
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbList, BreadcrumbLink, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import SearchBar from '@/components/globalSearch'
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import React, { useMemo, useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid, LabelList, Pie, PieChart, RadialBar, RadialBarChart, Rectangle, XAxis
} from "recharts"

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
} from "@mui/material";
import { Button, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Chip, Tooltip, ChipProps, Input } from "@heroui/react"
import { Pencil, Trash2, Search } from "lucide-react";

//Lead//
const chartConfig = {
  visitors: {
    label: "Leads",
  },
  Proposal: {
    label: "Proposal",
    color: "hsl(var(--chart-1))",
  },
  New: {
    label: "New",
    color: "hsl(var(--chart-2))",
  },
  Demo: {
    label: "Demo",
    color: "hsl(var(--chart-3))",
  },
  Discussion: {
    label: "Discussion",
    color: "hsl(var(--chart-4))",
  },
  Decided: {
    label: "Decided",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;
//Lead//


//Invoice//
const chartConfigInvoice = {
  visitors: {
    label: "Invoice",
  },
  Pending: {
    label: "New",
    color: "hsl(var(--chart-2))",
  },
  Unpaid: {
    label: "Demo",
    color: "hsl(var(--chart-3))",
  },
  Paid: {
    label: "Discussion",
    color: "hsl(var(--chart-4))",
  },

} satisfies ChartConfig;
//Invoice//


//Deal//
const chartConfigDeal = {
  visitors: {
    label: "Deals",
  },
  Proposal: {
    label: "Proposal",
    color: "hsl(var(--chart-1))",
  },
  Demo: {
    label: "Demo",
    color: "hsl(var(--chart-3))",
  },
  Discussion: {
    label: "Discussion",
    color: "hsl(var(--chart-4))",
  },
  Decided: {
    label: "Decided",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;
//Deal//

interface Lead {
  _id: string;
  companyName: string;
  customerName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  productName: string;
  amount: string;
  gstNumber: string;
  status: string;
  date: string;
  endDate: string;
  notes: string;
  isActive: string;
}

interface Invoice {
  _id: string;
  companyName: string;
  customerName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  gstNumber: string;
  productName: string;
  amount: number;
  discount: number;
  gstRate: number;
  status: string;
  date: Date;
  endDate: Date;
  totalWithoutGst: number;
  totalWithGst: number;
  paidAmount: number;
  remainingAmount: number;
}

interface Deal {
  _id: string;
  companyName: string;
  customerName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  productName: string;
  amount: string;
  gstNumber: string;
  status: string;
  date: string;
  endDate: string;
  notes: string;
  isActive: string;
}

interface Task {
  _id: string;
  subject: string;
  relatedTo: string;
  name: string;
  assigned: string;
  taskDate: string;
  dueDate: string;
  status: "Pending" | "Resolved" | "In Progress";
  priority: "High" | "Medium" | "Low";
  isActive: boolean;
}



interface CategorizedLeads {
  [key: string]: Lead[];
}

interface CategorizedInvoices {
  [key: string]: Invoice[];
}

interface CategorizedDeals {
  [key: string]: Deal[];
}

interface CategorizedTasks {
  [key: string]: Task[];
}


//lead//
const columns = [
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "CUSTOMER", uid: "customerName", sortable: true },
  { name: "CONTACT", uid: "contactNumber", sortable: true },
  { name: "EMAIL", uid: "emailAddress", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "PRODUCT", uid: "productName", sortable: true },
  { name: "AMOUNT", uid: "amount", sortable: true },
  { name: "GST", uid: "gstNumber", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "DATE", uid: "date", sortable: true },
  { name: "END DATE", uid: "endDate", sortable: true },
  { name: "ACTION", uid: "actions", sortable: true }
];

//Invoice//
const columnsInvoice = [
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "CUSTOMER", uid: "customerName", sortable: true },
  { name: "EMAIL", uid: "emailAddress", sortable: true },
  { name: "PRODUCT", uid: "productName", sortable: true },
];

const columnsDeal = [
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "CUSTOMER", uid: "customerName", sortable: true },
  { name: "EMAIL", uid: "emailAddress", sortable: true },
  { name: "PRODUCT", uid: "productName", sortable: true },
];

const columnsTask = [
  { name: "SUBJECT", uid: "subject", sortable: true },
  { name: "RELETED TO", uid: "relatedTo", sortable: true },
  { name: "CUSTOMER", uid: "name", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
]

const INITIAL_VISIBLE_COLUMNS = ["companyName", "customerName", "emailAddress", "productName"];

const INITIAL_VISIBLE_COLUMNS_INVOICE = ["companyName", "customerName", "emailAddress", "productName"];

const INITIAL_VISIBLE_COLUMNS_DEAL = ["companyName", "customerName", "emailAddress", "productName"];

const INITIAL_VISIBLE_COLUMNS_TASK = ["subject", "relatedTo", "name", "status"];

//Lead//
const chartData = {
  Proposal: "#2a9d90",
  New: "#e76e50",
  Discussion: "#274754",
  Demo: "#e8c468",
  Decided: "#f4a462",
};
//Lead//


//Invoice//
const chartDataInvoice = {
  Pending: "#2a9d90",
  Unpaid: "#e76e50",
  Paid: "#274754",
};
//Invoice//

//Deal//
const chartDataDeal = {
  Proposal: "#2a9d90",
  Discussion: "#274754",
  Demo: "#e8c468",
  Decided: "#f4a462",
};
//Deal//

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const getChartDimensions = () => {
  // Return responsive dimensions based on window width
  if (typeof window !== 'undefined') {
    const width = Math.min(600, window.innerWidth - 40); // 40px for padding
    const height = Math.min(400, width * 0.8);
    return { width, height };
  }
  return { width: 600, height: 400 }; // Default dimensions
};

export default function Page() {
  const [selectedChart, setSelectedChart] = useState("Pie Chart");
  const [selectedChartInvoice, setSelectedChartInvoice] = useState("Pie Chart");
  const [selectedChartDeal, setSelectedChartDeal] = useState("Pie Chart");


  const [filterValue, setFilterValue] = useState("");
  const [filterValueInvoice, setFilterValueInvoice] = useState("");
  const [filterValueDeal, setFilterValueDeal] = useState("");
  const [filterValueTask, setFilterValueTask] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [categorizedLeads, setCategorizedLeads] = useState<CategorizedLeads>({});
  const [categorizedInvoices, setCategorizedInvoices] = useState<CategorizedInvoices>({});
  const [categorizedDeals, setCategorizedDeals] = useState<CategorizedDeals>({});
  const [categorizedTasks, setCategorizedTasks] = useState<CategorizedTasks>({});
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageInvoice, setPageInvoice] = useState(1);
  const [pageDeal, setPageDeal] = useState(1);
  const [pageTask, setPageTask] = useState(1);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const hasSearchFilter = Boolean(filterValue);
  const hasSearchFilterInvoice = Boolean(filterValueInvoice);
  const hasSearchFilterDeal = Boolean(filterValueDeal);
  const hasSearchFilterTask = Boolean(filterValueTask);

  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedKeysInvoice, setSelectedKeysInvoice] = useState(new Set([]));
  const [selectedKeysDeal, setSelectedKeysDeal] = useState(new Set([]));
  const [selectedKeysTask, setSelectedKeysTask] = useState(new Set([]));

  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [visibleColumnsInvoice, setVisibleColumnsInvoice] = useState(new Set(INITIAL_VISIBLE_COLUMNS_INVOICE));
  const [visibleColumnsDeal, setVisibleColumnsDeal] = useState(new Set(INITIAL_VISIBLE_COLUMNS_DEAL));
  const [visibleColumnsTask, setVisibleColumnsTask] = useState(new Set(INITIAL_VISIBLE_COLUMNS_TASK));
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "companyName",
    direction: "ascending",
  });

  const [sortDescriptorDeal, setSortDescriptorDeal] = useState({
    column: "companyName",
    direction: "ascending",
  });

  const [sortDescriptorTask, setSortDescriptorTask] = useState({
    column: "subject",
    direction: "ascending",
  });

  const filteredItems = React.useMemo(() => {
    let filteredLeads = [...leads];


    if (hasSearchFilter) {
      filteredLeads = filteredLeads.filter((lead) => {
        const searchableFields = {
          companyName: lead.companyName,
          customerName: lead.customerName,
          emailAddress: lead.emailAddress,
          productName: lead.productName,
          status: lead.status
        };

        return Object.values(searchableFields).some(value =>
          String(value || '').toLowerCase().includes(filterValue.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filteredLeads = filteredLeads.filter((lead) =>
        statusFilter === lead.status
      );
    }

    return filteredLeads;
  }, [leads, filterValue, statusFilter]);

  const filteredItemsInvoice = React.useMemo(() => {
    let filteredInvoices = [...invoices];


    if (hasSearchFilterInvoice) {
      filteredInvoices = filteredInvoices.filter((invoice) => {
        const searchableFields = {
          companyName: invoice.companyName,
          customerName: invoice.customerName,
          emailAddress: invoice.emailAddress,
          productName: invoice.productName,
          status: invoice.status
        };

        return Object.values(searchableFields).some(value =>
          String(value || '').toLowerCase().includes(filterValueInvoice.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filteredInvoices = filteredInvoices.filter((invoice) =>
        statusFilter === invoice.status
      );
    }

    return filteredInvoices;
  }, [invoices, filterValueInvoice, statusFilter]);

  const filteredItemsDeal = React.useMemo(() => {
    let filteredDeals = [...deals];

    if (hasSearchFilterDeal) {
      filteredDeals = filteredDeals.filter((deal) => {
        const searchableFields = {
          companyName: deal.companyName,
          customerName: deal.customerName,
          emailAddress: deal.emailAddress,
          productName: deal.productName,
          status: deal.status
        };

        return Object.values(searchableFields).some(value =>
          String(value || '').toLowerCase().includes(filterValueDeal.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filteredDeals = filteredDeals.filter((deal) =>
        statusFilter === deal.status
      );
    }

    return filteredDeals;
  }, [deals, filterValueDeal, statusFilter]);

  const filteredItemsTask = React.useMemo(() => {
    let filteredTasks = [...tasks];

    if (hasSearchFilterTask) {
      filteredTasks = filteredTasks.filter((task) => {
        const searchableFields = {
          subject: task.subject,
          relatedTo: task.relatedTo,
          name: task.name,
          assigned: task.assigned,
          taskDate: task.taskDate,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
          isActive: task.isActive,
        };

        return Object.values(searchableFields).some(value =>
          String(value || '').toLowerCase().includes(filterValueTask.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter((task) =>
        statusFilter === task.status
      );
    }

    return filteredTasks;
  }, [tasks, filterValueTask, statusFilter]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const pagesInvoice = Math.ceil(invoices.length / rowsPerPage);

  const pagesDeal = Math.ceil(deals.length / rowsPerPage);

  const pagesTask = Math.ceil(tasks.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const itemsInvoice = React.useMemo(() => {
    const start = (pageInvoice - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItemsInvoice.slice(start, end);
  }, [pageInvoice, filteredItemsInvoice, rowsPerPage]);

  const itemsDeal = React.useMemo(() => {
    const start = (pageDeal - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItemsDeal.slice(start, end);
  }, [pageDeal, filteredItemsDeal, rowsPerPage]);

  const itemsTask = React.useMemo(() => {
    const start = (pageTask - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItemsTask.slice(start, end);
  }, [pageTask, filteredItemsTask, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Lead];
      const second = b[sortDescriptor.column as keyof Lead];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const sortedDeals = React.useMemo(() => {
    return [...itemsDeal].sort((a, b) => {
      const first = a[sortDescriptorDeal.column as keyof Deal];
      const second = b[sortDescriptorDeal.column as keyof Deal];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptorDeal.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptorDeal, itemsDeal]);

  const sortedTasks = React.useMemo(() => {
    return [...itemsTask].sort((a, b) => {
      const first = a[sortDescriptorTask.column as keyof Task];
      const second = b[sortDescriptorTask.column as keyof Task];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptorTask.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptorTask, itemsTask]);

  //Lead//
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/lead/getAllLeads');
        const result = await response.json();

        // Check if result is an object with data property
        if (!result || !Array.isArray(result.data)) {
          console.error('Invalid data format received:', result);
          return;
        }

        // Set the leads data for the table
        setLeads(result.data);

        // Categorize leads by status
        const categorized = result.data.reduce((acc: CategorizedLeads, lead: Lead) => {
          if (!acc[lead.status]) {
            acc[lead.status] = [];
          }
          acc[lead.status].push(lead);
          return acc;
        }, {} as CategorizedLeads);

        setCategorizedLeads(categorized);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);
  //Lead//

  //Invoice//
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/invoice/getAllInvoices');
        const result = await response.json();

        // Check if result is an object with data property
        if (!result || !Array.isArray(result.data)) {
          console.error('Invalid data format received:', result);
          return;
        }

        // Set the invoices data for the table
        setInvoices(result.data);

        // Categorize invoices by status
        const categorized = result.data.reduce((acc: CategorizedInvoices, invoice: Invoice) => {
          if (!acc[invoice.status]) {
            acc[invoice.status] = [];
          }
          acc[invoice.status].push(invoice);
          return acc;
        }, {} as CategorizedInvoices);

        setCategorizedInvoices(categorized);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);
  //Invoice//

  //Deal//
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/deal/getAllDeals');
        const result = await response.json();

        // Check if result is an object with data property
        if (!result || !Array.isArray(result.data)) {
          console.error('Invalid data format received:', result);
          return;
        }

        // Set the deals data for the table
        setDeals(result.data);

        // Categorize deals by status
        const categorized = result.data.reduce((acc: CategorizedDeals, deal: Deal) => {
          if (!acc[deal.status]) {
            acc[deal.status] = [];
          }
          acc[deal.status].push(deal);
          return acc;
        }, {} as CategorizedDeals);

        setCategorizedDeals(categorized);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);
  //Deal//

  //Task//
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/task/getAllTasks');
        const result = await response.json();

        // Check if result is an object with data property
        if (!result || !Array.isArray(result.data)) {
          console.error('Invalid data format received:', result);
          return;
        }

        // Set the tasks data for the table
        setTasks(result.data);

        // Categorize tasks by status
        const categorized = result.data.reduce((acc: CategorizedTasks, task: Task) => {
          if (!acc[task.status]) {
            acc[task.status] = [];
          }
          acc[task.status].push(task);
          return acc;
        }, {} as CategorizedTasks);

        setCategorizedTasks(categorized);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);


  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);



  //Lead Chart//
  const dynamicChartData = useMemo(() => {
    return Object.entries(categorizedLeads).map(([status, leads]) => ({
      browser: status,
      visitors: leads.length,
      fill: chartData[status] || "#ccc",
    }));
  }, [categorizedLeads]);
  //Lead Chart//

  //Invoice Chart//
  const dynamicChartDataInvoice = useMemo(() => {
    return Object.entries(categorizedInvoices).map(([status, invoices]) => ({
      browser: status,
      visitors: invoices.length,
      fill: chartDataInvoice[status] || "#ccc",
    }));
  }, [categorizedInvoices]);
  //Invoice Chart//

  //Deal//
  const dynamicChartDataDeal = useMemo(() => {
    return Object.entries(categorizedDeals).map(([status, deals]) => ({
      browser: status,
      visitors: deals.length,
      fill: chartDataDeal[status] || "#ccc",
    }));
  }, [categorizedDeals]);
  //Deal//




  //Lead//
  const renderChartLead = () => {
    const { width, height } = getChartDimensions();

    if (loading) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      );
    }

    if (dynamicChartData.length === 0) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Leads Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
            >
              <PieChart width={width} height={height}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <Pie
                  data={dynamicChartData}
                  dataKey="visitors"
                  nameKey="browser"
                  className="cursor-pointer"
                  style={{ color: "#FF7F3E" }}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="browser" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChart === "Pie Chart") {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Pie Chart - Leads</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
            >
              <PieChart width={width} height={height}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <Pie
                  data={dynamicChartData}
                  dataKey="visitors"
                  nameKey="browser"
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(width, height) / 4}
                  className="cursor-pointer"
                  style={{ color: "#FF7F3E" }}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="browser" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChart === "Radial Chart") {
      return (
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Radial Chart - Lead</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[400px]"
            >
              <RadialBarChart
                width={width}
                height={height}
                data={dynamicChartData}
                startAngle={-90}
                endAngle={380}
                innerRadius={Math.min(width, height) / 12}
                outerRadius={Math.min(width, height) / 4}
                cx="50%"
                cy="50%"
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <RadialBar dataKey="visitors" background>
                  <LabelList
                    position="insideStart"
                    dataKey="browser"
                    className="fill-white capitalize mix-blend-luminosity"
                    fontSize={11}
                  />
                </RadialBar>
              </RadialBarChart>
              <ChartLegend
                content={<ChartLegendContent nameKey="browser" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChart === "Bar Chart") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Lead Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart width={width} height={height} data={dynamicChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="browser"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    chartConfig[value as keyof typeof chartConfig]?.label
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="visitors"
                  strokeWidth={2}
                  radius={8}
                  fill="#8884d8"
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }
  };
  //Lead//

  //Invoice//
  const renderChartInvoice = () => {
    const { width, height } = getChartDimensions();

    if (loading) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      );
    }

    if (dynamicChartDataInvoice.length === 0) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Invoice Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigInvoice}
              className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
            >
              <PieChart width={width} height={height}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <Pie
                  data={dynamicChartDataInvoice}
                  dataKey="visitors"
                  nameKey="browser"
                  className="cursor-pointer"
                  style={{ color: "#FF7F3E" }}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="browser" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChartInvoice === "Pie Chart") {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Pie Chart - Invoice</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigInvoice}
              className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
            >
              <PieChart width={width} height={height}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <Pie
                  data={dynamicChartDataInvoice}
                  dataKey="visitors"
                  nameKey="browser"
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(width, height) / 4}
                  className="cursor-pointer"
                  style={{ color: "#FF7F3E" }}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="browser" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChartInvoice === "Radial Chart") {
      return (
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Radial Chart - Invoice</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigInvoice}
              className="mx-auto aspect-square max-h-[400px]"
            >
              <RadialBarChart
                width={width}
                height={height}
                data={dynamicChartDataInvoice}
                startAngle={-90}
                endAngle={380}
                innerRadius={Math.min(width, height) / 12}
                outerRadius={Math.min(width, height) / 4}
                cx="50%"
                cy="50%"
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <RadialBar dataKey="visitors" background>
                  <LabelList
                    position="insideStart"
                    dataKey="browser"
                    className="fill-white capitalize mix-blend-luminosity"
                    fontSize={11}
                  />
                </RadialBar>
              </RadialBarChart>
              <ChartLegend
                content={<ChartLegendContent nameKey="browser" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChartInvoice === "Bar Chart") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigInvoice}>
              <BarChart width={width} height={height} data={dynamicChartDataInvoice}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="browser"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    chartConfigInvoice[value as keyof typeof chartConfigInvoice]?.label
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="visitors"
                  strokeWidth={2}
                  radius={8}
                  fill="#8884d8"
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }
  };
  //Invoice//

  //Deal//
  const renderChartDeal = () => {
    const { width, height } = getChartDimensions();

    if (loading) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      );
    }

    if (dynamicChartDataDeal.length === 0) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Deals Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigDeal}
              className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
            >
              <PieChart width={width} height={height}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <Pie
                  data={dynamicChartDataDeal}
                  dataKey="visitors"
                  nameKey="browser"
                  className="cursor-pointer"
                  style={{ color: "#FF7F3E" }}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="browser" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChartDeal === "Pie Chart") {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Pie Chart - Deals</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigDeal}
              className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
            >
              <PieChart width={width} height={height}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <Pie
                  data={dynamicChartDataDeal}
                  dataKey="visitors"
                  nameKey="browser"
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(width, height) / 4}
                  className="cursor-pointer"
                  style={{ color: "#FF7F3E" }}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="browser" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChartDeal === "Radial Chart") {
      return (
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Radial Chart - Deal</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigDeal}
              className="mx-auto aspect-square max-h-[400px]"
            >
              <RadialBarChart
                width={width}
                height={height}
                data={dynamicChartDataDeal}
                startAngle={-90}
                endAngle={380}
                innerRadius={Math.min(width, height) / 12}
                outerRadius={Math.min(width, height) / 4}
                cx="50%"
                cy="50%"
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="browser" />}
                />
                <RadialBar dataKey="visitors" background>
                  <LabelList
                    position="insideStart"
                    dataKey="browser"
                    className="fill-white capitalize mix-blend-luminosity"
                    fontSize={11}
                  />
                </RadialBar>
              </RadialBarChart>
              <ChartLegend
                content={<ChartLegendContent nameKey="browser" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }

    if (selectedChartDeal === "Bar Chart") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Deal Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigDeal}>
              <BarChart width={width} height={height} data={dynamicChartDataDeal}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="browser"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    chartConfigDeal[value as keyof typeof chartConfigDeal]?.label
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="visitors"
                  strokeWidth={2}
                  radius={8}
                  fill="#8884d8"
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    }
  };
  //Deal//


  //lead//
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          // showControls
          showShadow
          color="success"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            // base: "gap-2 rounded-2xl shadow-lg p-2 dark:bg-default-100",
            cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
            item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
          }}
        />

        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  //Invoice//
  const bottomContentInvoice = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeysInvoice === "all"
            ? "All items selected"
            : `${selectedKeysInvoice.size} of ${filteredItemsInvoice.length} selected`}
        </span>
        <Pagination
          isCompact
          // showControls
          showShadow
          color="success"
          page={pageInvoice}
          total={pagesInvoice}
          onChange={setPageInvoice}
          classNames={{
            // base: "gap-2 rounded-2xl shadow-lg p-2 dark:bg-default-100",
            cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
            item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
          }}
        />

        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pagesInvoice === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pagesInvoice === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeysInvoice, itemsInvoice.length, pageInvoice, pagesInvoice, hasSearchFilterInvoice]);

  //Deal//
  const bottomContentDeal = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeysDeal === "all"
            ? "All items selected"
            : `${selectedKeysDeal.size} of ${filteredItemsDeal.length} selected`}
        </span>
        <Pagination
          isCompact
          showShadow
          color="success"
          page={pageDeal}
          total={pagesDeal}
          onChange={setPageDeal}
          classNames={{
            cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
            item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
          }}
        />

        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pagesDeal === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pagesDeal === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeysDeal, deals.length, pageDeal, pagesDeal, hasSearchFilterDeal]);

  //Task//
  const bottomContentTask = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeysTask === "all"
            ? "All items selected"
            : `${selectedKeysTask.size} of ${filteredItemsTask.length} selected`}
        </span>
        <Pagination
          isCompact
          showShadow
          color="success"
          page={pageTask}
          total={pagesTask}
          onChange={setPageTask}
          classNames={{
            cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
            item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
          }}
        />

        <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pagesTask === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button className="bg-[hsl(339.92deg_91.04%_52.35%)] rounded-lg" isDisabled={pagesTask === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeysTask, tasks.length, pageTask, pagesTask, hasSearchFilterTask]);

  const renderCell = React.useCallback((lead: Lead, columnKey: React.Key) => {
    const cellValue = lead[columnKey as keyof Lead];

    switch (columnKey) {
      case "companyName":
      case "customerName":
      case "contactNumber":
      case "emailAddress":
      case "productName":
      case "amount":
      case "gstNumber":
      case "date":
      case "endDate":
      case "notes":
        return cellValue;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[lead.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit lead">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Pencil size={20} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete lead">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <Trash2 size={20} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const renderCellInvoice = React.useCallback((invoice: Invoice, columnKey: React.Key) => {
    const cellValue = invoice[columnKey as keyof Invoice];

    switch (columnKey) {
      case "companyName":
      case "customerName":
      case "emailAddress":
      case "productName":
      case "amount":
      case "gstNumber":
      case "date":
      case "endDate":
      case "notes":
        return cellValue;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[invoice.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit lead">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Pencil size={20} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete lead">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <Trash2 size={20} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const renderCellDeal = React.useCallback((deal: Deal, columnKey: React.Key) => {
    const cellValue = deal[columnKey as keyof Deal];

    switch (columnKey) {
      case "companyName":
      case "customerName":
      case "contactNumber":
      case "emailAddress":
      case "productName":
      case "amount":
      case "gstNumber":
      case "date":
      case "endDate":
      case "notes":
        return cellValue;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[deal.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit deal">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Pencil size={20} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete deal">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <Trash2 size={20} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const renderCellTask = React.useCallback((task: Task, columnKey: React.Key) => {
    const cellValue = task[columnKey as keyof Task];

    switch (columnKey) {
      case "subject":
      case "relatedTo":
      case "name":
      case "assigned":
      case "taskDate":
      case "dueDate":
      case "status":
      case "priority":
      case "isActive":
        return cellValue;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[task.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit task">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Pencil size={20} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete task">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <Trash2 size={20} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);




  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex-1 flex justify-end space-x-4 mr-10">
                            <div  className="w-52">
                                <SearchBar/>
                            </div>
                        </div>
        </header>
        <Box sx={{ width: '100%' }}>
          <h1 className="text-2xl font-semibold mb-8 mt-4" style={{ textAlign: "center" }}>Charts</h1>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

            {/* Lead */}
            <Grid item xs={12} md={6} lg={4}>
              <Item>
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="chart-select-label">Select Chart</InputLabel>
                    <Select
                      labelId="chart-select-label"
                      value={selectedChart}
                      onChange={(e) => setSelectedChart(e.target.value)}
                      label="Select Chart"
                    >
                      <MenuItem value="Pie Chart">Pie Chart</MenuItem>
                      <MenuItem value="Radial Chart">Radial Chart</MenuItem>
                      <MenuItem value="Bar Chart">Bar Chart</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Render Selected Chart */}
                  <div className="mt-4">{renderChartLead()}</div>
                </div>
              </Item>
            </Grid>
            {/* End Lead */}

            {/* Invoice */}
            <Grid item xs={12} md={6} lg={4}>
              <Item>
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="chart-select-label">Select Chart</InputLabel>
                    <Select
                      labelId="chart-select-label"
                      value={selectedChartInvoice}
                      onChange={(e) => setSelectedChartInvoice(e.target.value)}
                      label="Select Chart"
                    >
                      <MenuItem value="Pie Chart">Pie Chart</MenuItem>
                      <MenuItem value="Radial Chart">Radial Chart</MenuItem>
                      <MenuItem value="Bar Chart">Bar Chart</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Render Selected Chart */}
                  <div className="mt-4">{renderChartInvoice()}</div>
                </div>
              </Item>
            </Grid>
            {/* End Invoice */}

            {/* Deal */}
            <Grid item xs={12} md={6} lg={4}>
              <Item>
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="chart-select-label">Select Chart</InputLabel>
                    <Select
                      labelId="chart-select-label"
                      value={selectedChartDeal}
                      onChange={(e) => setSelectedChartDeal(e.target.value)}
                      label="Select Chart"
                    >
                      <MenuItem value="Pie Chart">Pie Chart</MenuItem>
                      <MenuItem value="Radial Chart">Radial Chart</MenuItem>
                      <MenuItem value="Bar Chart">Bar Chart</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Render Selected Chart */}
                  <div className="mt-4">{renderChartDeal()}</div>
                </div>
              </Item>
            </Grid>
            {/* End Deal */}

            {/* Lead Table */}
            <Grid item xs={12} lg={6}>
              <h1 className="text-2xl font-semibold mb-4 mt-4" style={{ textAlign: "center" }}>Lead Table</h1>
              <Item>
                <div className="flex justify-between items-center gap-3">
                  <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by name, email, product..."
                    startContent={<Search size={20} />}
                    value={filterValue}
                    onClear={() => setFilterValue("")}
                    onValueChange={setFilterValue}
                  />
                </div>
                <Table
                  isHeaderSticky
                  aria-label="Leads table with custom cells, pagination and sorting"
                  bottomContent={bottomContent}
                  bottomContentPlacement="outside"
                  classNames={{
                    wrapper: "max-h-[382px]",
                  }}
                  selectedKeys={selectedKeys}
                  selectionMode="multiple"
                  sortDescriptor={sortDescriptor}
                  onSelectionChange={setSelectedKeys}
                  onSortChange={setSortDescriptor}
                >
                  <TableHeader columns={headerColumns}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody emptyContent={"No leads found"} items={sortedItems}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Item>
            </Grid>

            {/* Invoice Table */}
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <h1 className="text-2xl font-semibold mb-4 mt-4" style={{ textAlign: "center" }}>Invoice Table</h1>
              <Item>
                <div className="flex justify-between items-center gap-3">
                  <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by name, email, product..."
                    startContent={<Search size={20} />}
                    value={filterValueInvoice}
                    onClear={() => setFilterValueInvoice("")}
                    onValueChange={setFilterValueInvoice}
                  />
                </div>
                <Table
                  isHeaderSticky
                  aria-label="Invoices table with custom cells, pagination and sorting"
                  bottomContent={bottomContentInvoice}
                  bottomContentPlacement="outside"
                  classNames={{
                    wrapper: "max-h-[382px]",
                  }}
                  selectedKeys={selectedKeysInvoice}
                  selectionMode="multiple"
                  topContentPlacement="outside"
                >
                  <TableHeader columns={columnsInvoice}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody emptyContent={"No invoices found"} items={itemsInvoice}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => <TableCell>{renderCellInvoice(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Item>
            </Grid>

            {/* Deal Table */}
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <h1 className="text-2xl font-semibold mb-4 mt-4" style={{ textAlign: "center" }}>Deal Table</h1>
              <Item>
                <div className="flex justify-between items-center gap-3">
                  <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by name, email, product..."
                    startContent={<Search size={20} />}
                    value={filterValueDeal}
                    onClear={() => setFilterValueDeal("")}
                    onValueChange={setFilterValueDeal}
                  />
                </div>
                <Table
                  isHeaderSticky
                  aria-label="Deals table with custom cells, pagination and sorting"
                  bottomContent={bottomContentDeal}
                  bottomContentPlacement="outside"
                  classNames={{
                    wrapper: "max-h-[382px]",
                  }}
                  selectedKeys={selectedKeysDeal}
                  selectionMode="multiple"
                  sortDescriptor={sortDescriptorDeal}
                  onSortChange={setSortDescriptorDeal}
                  topContentPlacement="outside"
                >
                  <TableHeader columns={columnsDeal}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody emptyContent={"No deals found"} items={sortedDeals}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => <TableCell>{renderCellDeal(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Item>
            </Grid>

            {/* Task Table */}
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <h1 className="text-2xl font-semibold mb-4 mt-4" style={{ textAlign: "center" }}>Task Table</h1>
              <Item>
                <div className="flex justify-between items-center gap-3">
                  <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by name, email, product..."
                    startContent={<Search size={20} />}
                    value={filterValueTask}
                    onClear={() => setFilterValueTask("")}
                    onValueChange={setFilterValueTask}
                  />
                </div>
                <Table
                  isHeaderSticky
                  aria-label="Tasks table with custom cells, pagination and sorting"
                  bottomContent={bottomContentTask}
                  bottomContentPlacement="outside"
                  classNames={{
                    wrapper: "max-h-[382px]",
                  }}
                  selectedKeys={selectedKeysTask}
                  selectionMode="multiple"
                  sortDescriptor={sortDescriptorTask}
                  onSelectionChange={setSelectedKeysTask}
                  onSortChange={setSortDescriptorTask}
                >
                  <TableHeader columns={columnsTask}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody emptyContent={"No tasks found"} items={sortedTasks}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => <TableCell>{renderCellTask(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Item>

            </Grid>

            {/* Remainder Table */}
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <h1 className="text-2xl font-semibold mb-4 mt-4" style={{ textAlign: "center" }}>Remainder Table</h1>
              <Item>
                <Item>
                  <Table
                    isHeaderSticky
                    aria-label="Invoices table with custom cells, pagination and sorting"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                      wrapper: "max-h-[382px]",
                    }}
                    selectedKeys={selectedKeys}
                    selectionMode="multiple"
                    topContentPlacement="outside"
                  >
                    <TableHeader columns={headerColumns}>
                      {(column) => (
                        <TableColumn
                          key={column.uid}
                          align={column.uid === "actions" ? "center" : "start"}
                          allowsSorting={column.sortable}
                        >
                          {column.name}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody emptyContent={"No invoices found"} items={sortedItems}>
                      {(item) => (
                        <TableRow key={item._id}>
                          {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Item>
              </Item>
            </Grid>

            {/* Scedule Table */}
            <Grid item xs={12} sm={6} md={6} lg={6}>
              <h1 className="text-2xl font-semibold mb-4 mt-4" style={{ textAlign: "center" }}>Scedule Table</h1>
              <Item>
                <Item>
                  <Table
                    isHeaderSticky
                    aria-label="Invoices table with custom cells, pagination and sorting"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                      wrapper: "max-h-[382px]",
                    }}
                    selectedKeys={selectedKeys}
                    selectionMode="multiple"
                    topContentPlacement="outside"
                  >
                    <TableHeader columns={headerColumns}>
                      {(column) => (
                        <TableColumn
                          key={column.uid}
                          align={column.uid === "actions" ? "center" : "start"}
                          allowsSorting={column.sortable}
                        >
                          {column.name}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody emptyContent={"No invoices found"} items={sortedItems}>
                      {(item) => (
                        <TableRow key={item._id}>
                          {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Item>
              </Item>
            </Grid>
          </Grid>
        </Box>
      </SidebarInset>
    </SidebarProvider>
  )
}