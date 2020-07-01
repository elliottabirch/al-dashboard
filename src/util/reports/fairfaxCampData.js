const cheerio = require("cheerio");
const hl = require("highland");
const { createBook } = require("./util");
const {
  endPoints: { fairfaxData }
} = require("./constants");

const fairFaxHeaders = {
  campCode: "Camp Code",
  location: "Camp Location",
  dateRange: "Date Range",
  openSpots: "Open Spots",
  sessionName: "Session Name"
};

console.log(fairfaxData);
module.exports = () =>
  hl(fetch(fairfaxData))
    .flatMap(response => hl(response.text()))
    .map(data => cheerio.load(data))
    .map($ => {
      const nodeRowsH2 = $(".FindTour")
        .contents()
        .map((i, el) => el.data)
        .toArray()
      console.log ( nodeRowsH2 );
    
      nodeRowsH2.forEach(function(i, o) {
        $("#mainContent_repeaterActivities_activitySnapshot_"+o+"_sessionPanel").find('tr').append('<td>'+i+'</td>');

      });  
     
      // pankaj@advernturelinks.net modified..
      const nodeRows = $(".sessions.panel")
        .find("tbody")
        .find("tr")
        .toArray();
      const textRows = nodeRows.map(row =>
        $(row)
          .find("td")
          .contents()
          .map((i, el) => el.data)
          .toArray()
          .map(a => a.trim())
          .filter(a => !!a)
      );
      console.log ( textRows ) ; 
      return textRows.map(([campCode, location, dateRange, , , openSpots,,sessionName]) => ({
        sessionName,
        campCode,
        location,
        dateRange,
        openSpots
        
        
        
      }));
    })
    .map(rows => [fairFaxHeaders, ...rows])
    .collect()
    .map(sheets => createBook(sheets, 0, fairFaxHeaders, "Fairfax Enrollment"))
    .merge();
