import { NumericTextBox as KendoNumericTextBox, NumericTextBoxChangeEvent, NumericTextBoxProps } from "@progress/kendo-react-inputs";

const NumericTextBox = ({...props}: NumericTextBoxProps) => {
    return <KendoNumericTextBox {...props} />
}

export {NumericTextBox, type NumericTextBoxProps, type NumericTextBoxChangeEvent};