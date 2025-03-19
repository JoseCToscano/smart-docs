import { DropDownList as KendoDropDownList, DropDownListProps } from "@progress/kendo-react-dropdowns";

const DropDownList = ({...props}: DropDownListProps) => {
    return <KendoDropDownList {...props} />
}

export { DropDownList, type DropDownListProps };