"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, UserCircle, MapPin, LogOut } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import SidebarNav from "@/components/layout/SidebarNav";
import PageHeader from "@/components/layout/PageHeader";
import Table, { TableRow, TableCell } from "@/components/ui/Table";

type Tab = "orders" | "profile" | "addresses";

export default function AccountPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const mockOrders = [
    { id: "#ORD-9021", date: "12 Oct 2026", status: "delivered", total: "1,250.00" },
    { id: "#ORD-9022", date: "05 Nov 2026", status: "processing", total: "840.00" },
  ];

  const mockAddresses = [
    { id: 1, name: "Home", text: "123 Olaya St, Riyadh, Saudi Arabia", isDefault: true },
    { id: 2, name: "Work", text: "King Abdullah Financial District, Riyadh", isDefault: false },
  ];

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <PageHeader
          title={language === "ar" ? "حسابي" : "My Account"}
          description={
            language === "ar" ? "مرحباً بك، أحمد محمد" : "Welcome back, Ahmed Mohammad"
          }
        />

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-1/4 shrink-0">
            <Card variant="panel" padding="md" className="sticky top-32">
              <SidebarNav
                variant="light"
                activeKey={activeTab}
                items={[
                  {
                    key: "orders",
                    label: language === "ar" ? "طلباتي" : "My Orders",
                    icon: <Package size={20} />,
                    onClick: () => setActiveTab("orders"),
                  },
                  {
                    key: "profile",
                    label: language === "ar" ? "إعدادات الحساب" : "Profile Settings",
                    icon: <UserCircle size={20} />,
                    onClick: () => setActiveTab("profile"),
                  },
                  {
                    key: "addresses",
                    label: language === "ar" ? "العناوين المحفوظة" : "Saved Addresses",
                    icon: <MapPin size={20} />,
                    onClick: () => setActiveTab("addresses"),
                  },
                ]}
              />
              <div className="h-px bg-gray-100 my-2" />
              <SidebarNav
                variant="light"
                items={[
                  {
                    key: "logout",
                    label: language === "ar" ? "تسجيل الخروج" : "Log Out",
                    icon: <LogOut size={20} />,
                    danger: true,
                    onClick: () => undefined,
                  },
                ]}
              />
            </Card>
          </aside>

          <div className="lg:w-3/4">
            {activeTab === "orders" && (
              <Card variant="panel" padding="lg">
                <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                  {language === "ar" ? "سجل الطلبات" : "Order History"}
                </h2>
                <Table
                  framed={false}
                  minWidth="600px"
                  headers={[
                    language === "ar" ? "رقم الطلب" : "Order ID",
                    language === "ar" ? "التاريخ" : "Date",
                    language === "ar" ? "الحالة" : "Status",
                    language === "ar" ? "الإجمالي" : "Total",
                    "",
                  ]}
                >
                  {mockOrders.map((order, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold text-secondary">{order.id}</TableCell>
                      <TableCell className="text-gray-500">{order.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="font-bold text-secondary">
                        {order.total} SAR
                      </TableCell>
                      <TableCell align="end">
                        <button className="text-primary font-medium hover:underline">
                          {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Card>
            )}

            {activeTab === "profile" && (
              <Card variant="panel" padding="lg">
                <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                  {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                </h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <FormField label={language === "ar" ? "الاسم الأول" : "First Name"}>
                    <Input type="text" defaultValue="أحمد" />
                  </FormField>
                  <FormField label={language === "ar" ? "اسم العائلة" : "Last Name"}>
                    <Input type="text" defaultValue="محمد" />
                  </FormField>
                  <FormField
                    className="md:col-span-2"
                    label={language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                  >
                    <Input type="email" defaultValue="ahmed@example.com" />
                  </FormField>
                  <FormField
                    className="md:col-span-2"
                    label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  >
                    <Input
                      type="tel"
                      defaultValue="+966 50 123 4567"
                      className="text-start dir-ltr"
                    />
                  </FormField>
                  <div className="md:col-span-2 pt-4">
                    <Button variant="secondary" size="lg">
                      {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === "addresses" && (
              <Card variant="panel" padding="lg">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-secondary">
                    {language === "ar" ? "عناويني" : "My Addresses"}
                  </h2>
                  <Button variant="soft" size="sm">
                    {language === "ar" ? "+ إضافة عنوان" : "+ Add Address"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-100 rounded-xl p-6 bg-gray-50 relative group hover:border-primary transition-colors"
                    >
                      {address.isDefault && (
                        <Badge
                          variant="success"
                          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-[10px] rounded-md px-2"
                        >
                          {language === "ar" ? "الافتراضي" : "Default"}
                        </Badge>
                      )}
                      <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {address.name}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {address.text}
                      </p>
                      <div className="flex gap-4 border-t border-gray-200 pt-4">
                        <button className="text-primary font-medium text-sm hover:underline">
                          {language === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button className="text-red-500 font-medium text-sm hover:underline">
                          {language === "ar" ? "حذف" : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
