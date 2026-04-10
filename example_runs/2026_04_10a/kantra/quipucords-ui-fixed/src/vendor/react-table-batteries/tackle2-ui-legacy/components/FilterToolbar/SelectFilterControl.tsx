import * as React from 'react';
import { ToolbarFilter, Select, SelectOption, SelectList, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import { FilterControlProps } from './FilterControl';
import { SelectFilterCategory, OptionPropsWithKey } from './FilterToolbar';

export interface SelectFilterControlProps<TItem, TFilterCategoryKey extends string>
  extends FilterControlProps<TItem, TFilterCategoryKey> {
  category: SelectFilterCategory<TItem, TFilterCategoryKey>;
  isScrollable?: boolean;
}

export const SelectFilterControl = <TItem, TFilterCategoryKey extends string>({
  category,
  filterValue,
  setFilterValue,
  showToolbarItem,
  isDisabled = false,
  isScrollable = false,
  id
}: React.PropsWithChildren<SelectFilterControlProps<TItem, TFilterCategoryKey>>): JSX.Element | null => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);

  const getOptionKeyFromOptionValue = (optionValue: string) =>
    category.selectOptions.find(optionProps => optionProps.value === optionValue)?.key;

  const getChipFromOptionValue = (optionValue: string | undefined) =>
    optionValue ? optionValue.toString() : '';

  const getOptionKeyFromChip = (chip: string) =>
    category.selectOptions.find(optionProps => optionProps.value.toString() === chip)?.key;

  const getOptionValueFromOptionKey = (optionKey: string) =>
    category.selectOptions.find(optionProps => optionProps.key === optionKey)?.value;

  const onFilterSelect = (value: string) => {
    const optionKey = getOptionKeyFromOptionValue(value);
    setFilterValue(optionKey ? [optionKey] : null);
    setIsFilterDropdownOpen(false);
  };

  const onFilterClear = (chip: string) => {
    const optionKey = getOptionKeyFromChip(chip);
    const newValue = filterValue ? filterValue.filter(val => val !== optionKey) : [];
    setFilterValue(newValue.length > 0 ? newValue : null);
  };

  // Select expects "selections" to be an array of the "value" props from the relevant optionProps
  const selections = filterValue ? filterValue.map(getOptionValueFromOptionKey) : null;

  const chips = selections ? selections.map(getChipFromOptionValue) : [];

  const renderSelectOptions = (options: OptionPropsWithKey[]) =>
    options.map(optionProps => <SelectOption {...optionProps} key={optionProps.key} />);

  return (
    <ToolbarFilter
      id={`${id}-filter-control-${category.key}`}
      labels={chips}
      deleteLabel={(_, chip) => onFilterClear(chip as string)}
      categoryName={category.title}
      showToolbarItem={showToolbarItem}
    >
      <Select
        className={css(isScrollable && 'isScrollable')}
        isOpen={isFilterDropdownOpen}
        onSelect={(_event, value) => onFilterSelect(value as string)}
        onOpenChange={setIsFilterDropdownOpen}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            id={`${id}-${category.key}-filter-value-select`}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            isDisabled={isDisabled || category.selectOptions.length === 0}
            isExpanded={isFilterDropdownOpen}
            aria-label={category.title}
          >
            {selections && selections.length > 0 ? getChipFromOptionValue(selections[0]) : 'Any'}
          </MenuToggle>
        )}
      >
        <SelectList>
          {renderSelectOptions(category.selectOptions)}
        </SelectList>
      </Select>
    </ToolbarFilter>
  );
};
