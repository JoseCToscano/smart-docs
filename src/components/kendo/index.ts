// Re-export all components for easy imports
export * from './premium';
export * from './free';

// Export layout components that we use
export { Avatar, Splitter } from "@progress/kendo-react-layout";
export { Popup } from "@progress/kendo-react-popup";

// Also re-export svg icons that we use
export { 
  arrowsLeftRightIcon, 
  menuIcon,
  // Text formatting icons
  boldIcon,
  italicIcon,
  underlineIcon,
  // Alignment icons
  alignLeftIcon,
  alignCenterIcon,
  alignRightIcon,
  // List icons
  listOrderedIcon,
  listUnorderedIcon,
  // Indentation icons
  indentIcon,
  outdentIcon,
  // Media icons
  imageIcon,
  linkIcon,
  tableIcon
} from "@progress/kendo-svg-icons"; 