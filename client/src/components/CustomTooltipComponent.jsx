import React from 'react';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

const CustomTooltipComponent = ({ icon: Icon, tooltipText, onClick, currentColor, disabled }) => {
    return (
        <TooltipComponent content={tooltipText} position="BottomCenter">
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                style={{ backgroundColor: currentColor }}
                className="text-lg p-2 rounded-full text-white hover:drop-shadow-xl hover:bg-light-gray mx-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Icon />
            </button>
        </TooltipComponent>
    );
};

export default CustomTooltipComponent;
