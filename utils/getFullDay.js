﻿var getFullDay = (day) => {
    day = String(day);
    if (day.charAt(day.length - 1) == "1")
        return day + "st";
    else

    if (day.charAt(day.length - 1) == "2")
        return day + "nd";
    else

    if (day.charAt(day.length - 1) == "3")
        return day + "rd";

    else
        return day + "th";
}

module.exports = getFullDay;