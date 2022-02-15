import React from "react";
import classnames from "classnames";
import styles from "./styles.module.scss";

import type { FullField } from "../../types";

interface Props {
    field: FullField;
}

const Input: React.FC<Props> = ({ field }) => {
    return (
        <div className={styles.container}>
            <div className={classnames({ [styles.touched]: field.touched })}>
                <div className={classnames({ [styles.changed]: field.changed })}>
                    <input {...field.props} />
                    <div>{JSON.stringify(field.error)}</div>
                </div>
            </div>
        </div>
    );
};

export { Input };
