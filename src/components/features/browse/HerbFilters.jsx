import FacetFilters from "./FacetFilters";

function HerbFilters({
  availableBenefits,
  selectedBenefits,
  onBenefitChange,
  approvalFilter,
  onApprovalChange,
  hasActiveFilters,
  onClearFilters,
}) {
  const approvalOptions = [
    { value: "all", label: "All Herbs" },
    { value: "approved", label: "Approved Only" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <FacetFilters
      singleFilter={{
        label: "Status",
        value: approvalFilter,
        options: approvalOptions,
        onChange: onApprovalChange,
      }}
      multiFilter={{
        label: "Benefits",
        options: availableBenefits,
      }}
      selectedItems={selectedBenefits}
      onToggleItem={onBenefitChange}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
    />
  );
}

export default HerbFilters;
