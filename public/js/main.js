$(document).ready(function () {

  var name, animal_name, breed, country, comment, email;
  var filename = $("#latest_filename").html();

  console.log(filename);


  $(".disabled").click(function(){
    e.stopImmediatePropagation();
    return false;
  });

  //init breed
  $("#breed_data").val($('#breed_dropdown').val());

  //breed dropdown
  $('#breed_dropdown').dropdown({
    onChange: function (value, text, $selectedItem) {
      //remove line breaks
      var breed_value = value.replace(/(\r\n\t|\n|\r\t)/gm, "");
      //remove — if exists
      var str_len = breed_value.length;
      for (var i = 0; i < str_len; i++)
        breed_value = breed_value.replace("—", "");

      $("#breed_data").val(breed_value);
    },
    forceSelection: false,
    selectOnKeydown: false,
    showOnFocus: false,
    on: "hover"
  });

  //init breed
  $("#country_data").val($('#country_dropdown').val());

  //country dropdown
  $('#country_dropdown').dropdown({
    onChange: function (value, text, $selectedItem) {
      $("#country_data").val(value);
    },
    forceSelection: false,
    selectOnKeydown: false,
    showOnFocus: false,
    on: "hover"
  });

  //survey form submit
  $("#btn_submit").click(function () {

    name = $("#form_name").val();
    animal_name = $("#form_animal").val();
    breed = $("#breed_data").val();
    country = $("#country_data").val();
    comment = $("#form_comment").val();
    email = $("#form_email").val();

    if (name == "") {
      $.uiAlert({
        textHead: 'Your name is required.', // header
        text: 'Input your name, then try again', // Text
        bgcolor: '#F2711C', // background-color
        textcolor: '#fff', // color
        position: 'top-center',// position . top And bottom ||  left / center / right
        icon: 'warning sign', // icon in semantic-UI
        time: 3, // time
      });
    } else if (animal_name == "") {
      $.uiAlert({
        textHead: 'Animal name is required.', // header
        text: 'Input animal name, then try again', // Text
        bgcolor: '#F2711C', // background-color
        textcolor: '#fff', // color
        position: 'top-center',// position . top And bottom ||  left / center / right
        icon: 'warning sign', // icon in semantic-UI
        time: 3, // time
      });
    } else if (breed == "") {
      $.uiAlert({
        textHead: 'Breed is required.', // header
        text: 'Select breed correctly, then try again', // Text
        bgcolor: '#F2711C', // background-color
        textcolor: '#fff', // color
        position: 'top-center',// position . top And bottom ||  left / center / right
        icon: 'warning sign', // icon in semantic-UI
        time: 3, // time
      });
    } else if (country == "") {
      $.uiAlert({
        textHead: 'Country is required.', // header
        text: 'Select your country correctly, then try again', // Text
        bgcolor: '#F2711C', // background-color
        textcolor: '#fff', // color
        position: 'top-center',// position . top And bottom ||  left / center / right
        icon: 'warning sign', // icon in semantic-UI
        time: 3, // time
      });
    } else if (comment == "") {
      $.uiAlert({
        textHead: 'Comment is required.', // header
        text: 'Input comment, then try again', // Text
        bgcolor: '#F2711C', // background-color
        textcolor: '#fff', // color
        position: 'top-center',// position . top And bottom ||  left / center / right
        icon: 'warning sign', // icon in semantic-UI
        time: 3, // time
      });
    }else{
      $('#modal_email')
      .modal({
        blurring: true
      })
      .modal('show');
    }    

  });

  //submit form
  $("#btn_email").click(function(){
    email = $("#email_input").val();
    $("#form_email").val(email);

    $("form#add_survey").submit();
  });

  //show bubble chart for breed
  breed_bubble();

  function breed_bubble() {
    var diameter = 600,
      format = d3.format(",d"),
      color = d3.scale.category20c();

    var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(1.5);

    var svg = d3.select("#breed_bubble").append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");

    var tooltip = d3.select("#about_us")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("color", "white")
      .style("padding", "8px")
      .style("background-color", "rgba(0, 0, 0, 0.75)")
      .style("border-radius", "6px")
      .style("font", "12px sans-serif")
      .text("tooltip");

    d3.json("./cronjob/bubble/" + filename, function (error, root) {
      var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(root))
          .filter(function (d) { return !d.children; }))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("circle")
        .attr("r", function (d) { return d.r; })
        .style("fill", function (d) { return color(d.value); })
        .on("mouseover", function (d) {
          tooltip.text(d.className + ": " + format(d.value));
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function () {
          return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

      node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .text(function (d) { return d.className.substring(0, d.r / 3); });
    });

    // Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
      var classes = [];

      function recurse(name, node) {
        if (node.children) node.children.forEach(function (child) { recurse(node.name, child); });
        else classes.push({ packageName: name, className: node.name, value: node.size });
      }

      recurse(null, root);
      return { children: classes };
    }

    d3.select(self.frameElement).style("height", diameter + "px");
  }


  //show word char for comment 

  $.getJSON('./cronjob/word/' + filename, function (data) {

    var text_string = data['data'];

    console.log("comment: '" + text_string + "'");

    drawWordCloud(text_string);

    function drawWordCloud(text_string) {
      var common = "I,poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";

      console.log("in drawWordCloud");

      var word_count = {};

      var words = text_string.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
      if (words.length == 1) {
        word_count[words[0]] = 1;
      } else {
        words.forEach(function (word) {
          var word = word.toLowerCase();
          if (word != "" && common.indexOf(word) == -1 && word.length > 1) {
            if (word_count[word]) {
              word_count[word]++;
            } else {
              word_count[word] = 1;
            }
          }
        })
      }

      var svg_location = "#word_chart";
      var width = 600;
      var height = 500;

      var fill = d3.scale.category20();

      var word_entries = d3.entries(word_count);

      var xScale = d3.scale.linear()
        .domain([0, d3.max(word_entries, function (d) {
          return d.value;
        })
        ])
        .range([10, 100]);

      d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function (d) { return xScale(+d.value); })
        .text(function (d) { return d.key; })
        .rotate(function () { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .on("end", draw)
        .start();

      function draw(words) {
        d3.select(svg_location).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function (d) { return xScale(d.value) + "px"; })
          .style("font-family", "Impact")
          .style("fill", function (d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function (d) { return d.key; });
      }

      d3.layout.cloud().stop();
    }
  });

});
