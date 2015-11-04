var NetcamAPIVars = (function(){
    var config = {};

    config.EVENT_LOGS_ROW_NUMBER = 25;
    config.EVENT_LOGS_MIN_CRIT = 0;
    config.LIBRARY_ITEMS_NUMBER = 30;
    config.LIBRARY_SOURCE_ID = -1;
    config.LIBRARY_ALL_SOURCES = -1;
    config.LIBRARY_RECORDS_NUMBER = 0;
    config.LIBRARY_PAGE_NUMBER = 1;

    var now = new Date();
    var yesterday = new Date();
    yesterday.setTime(now.getTime() - 86400000);

    var weekAgo = new Date();
    weekAgo.setTime(now.getTime() - (7 * 86400000));

    var monthAgo = new Date();
    monthAgo.setTime(now.getTime() - (31 * 86400000));

    var tomorrow = new Date();
    tomorrow.setTime(now.getTime() + 86400000);

    config.libraryStartDate = yesterday;
    config.libraryEndDate = tomorrow;

    config.Yesterday = yesterday;
    config.WeekAgo = weekAgo;
    config.MonthAgo = monthAgo;
    config.Tomorrow = tomorrow;

    return config;
}());

var NetcamStates = {
    MULTIVIEW_MODE: 4
};