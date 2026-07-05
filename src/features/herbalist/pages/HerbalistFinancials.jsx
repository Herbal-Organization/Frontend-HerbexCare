import React from "react";
import { useTranslation } from "react-i18next";
import { MdAttachMoney, MdAccountBalanceWallet, MdHistory } from "react-icons/md";
import { Spinner, StatusBadge } from "@components/common";
import { useHerbalistFinancials } from "@features/herbalist/hooks/useHerbalistFinancials";

function HerbalistFinancials() {
  const { t } = useTranslation();
  const { data, isLoading, error, reload } = useHerbalistFinancials();

  // TODO: remove after verifying API response shape
  console.log("[Earnings] raw data:", data);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button
          onClick={reload}
          className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors"
        >
          {t("common.retry", "Retry")}
        </button>
      </div>
    );
  }

  // The API returns an array of transaction objects:
  // [{ taskId: 57, productName: "Chamomile", amount: 25184, status: "Shipped", date: "..." }, ...]
  const transactions = Array.isArray(data) ? data : [];
  
  const activeTransactions = transactions.filter(t => t.status !== "Cancelled");
  
  const totalEarnings = activeTransactions
    .filter(t => ["Shipped", "Delivered"].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
    
  const pendingBalance = activeTransactions
    .filter(t => ["Pending", "AwaitingPayment", "Preparing"].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
    
  const completedTasks = activeTransactions.filter(t => ["Shipped", "Delivered"].includes(t.status)).length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("herbalistDashboard.earnings", "Earnings Dashboard")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t(
            "herbalistDashboard.earningsDescription",
            "Track your financial performance and pending payouts."
          )}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Earnings Card */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 group hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-500/10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <MdAttachMoney className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("herbalistDashboard.totalEarnings", "Total Earnings")}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                ${Number(totalEarnings).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 group hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-amber-500/10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <MdAccountBalanceWallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("herbalistDashboard.pendingBalance", "Pending Balance")}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                ${Number(pendingBalance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Tasks/Transactions Card */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 group hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-blue-500/10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <MdHistory className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("herbalistDashboard.completedTasks", "Completed Tasks")}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {completedTasks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {t("herbalistDashboard.financialDetails", "Financial Details")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">{t("herbalistDashboard.taskId", "Task ID")}</th>
                <th scope="col" className="px-6 py-4 font-medium">{t("herbalistDashboard.productName", "Product Name")}</th>
                <th scope="col" className="px-6 py-4 font-medium">{t("herbalistDashboard.amount", "Amount")}</th>
                <th scope="col" className="px-6 py-4 font-medium">{t("herbalistDashboard.status", "Status")}</th>
                <th scope="col" className="px-6 py-4 font-medium">{t("herbalistDashboard.date", "Date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t("herbalistDashboard.noTransactions", "No transactions found.")}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.taskId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{tx.taskId}</td>
                    <td className="px-6 py-4">{tx.productName}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${Number(tx.amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HerbalistFinancials;
