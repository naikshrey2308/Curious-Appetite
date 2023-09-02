import { memo, useRef } from "react";

function Input(props) {
    const [value, setValue] = [props.value, props.setValue];
    const field = useRef();
    const error = useRef();

    function checkValue() {
        if(props.validate) {
            if(field.current.value.match(props.pattern)) {
                field.current.classList.remove("invalid-input");
                field.current.classList.add("valid-input");
                error.current.classList.replace("text-danger", "text-success");
                error.current.textContent = "";
            } else {
                field.current.classList.remove("valid-input");
                field.current.classList.add("invalid-input");
                error.current.classList.replace("text-success", "text-danger");
                error.current.textContent = props.patternMatchError;
            }
        }
        setValue(field.current.value);
    }

    return (
        <>
            <input ref={field} value={value} type={props.type} onChange={checkValue} pattern={props.pattern} className="mt-3 input-control form-control" placeholder={props.placeholder} required={props.required} min={props.min} max={props.max} />
            <p ref={error} style={{fontSize: 12}} className="text-start text-danger mt-1 mb-3"></p>
        </>
    );
}

export default memo(Input);