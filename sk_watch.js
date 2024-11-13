javascript:
        if (document.URL.match("mode=incomings&subtype=attacks")) {
                $("#incomings_table").find("tr").eq(0).find("th").last().after('<th>Watchtower</th>');
                var url = "https://" + location.host + game_data.link_base_pure + "overview_villages&mode=buildings&group=0&page=-1",
                        url2 = "https://" + location.host + "/interface.php?func=get_unit_info",
                        towerCoords = [],
                        towerLevels = [],
                        unitSpeed = [],
                        intersectionPoints = [],
                        block = [],
                        timesRun = 1,
                        rows = Number($("#incomings_table").find("th").first().text().split(" ")[1].replace("(", "").replace(")", ""));
 
                function first() {
                        $.ajax({
                                url: url2,
                                async: false,
                                success: function(data) {
                                        $.each(["sword", "axe", "spy", "light", "heavy", "ram", "snob"], function(key, val) {
                                                // extract unit speeds
                                                unitSpeed.push(Number($(data).find("config > " + val + " > speed").text()) * 60);
                                        })
                                        $.ajax({
                                                url: url,
                                                async: false,
                                                success: function(datas) {
                                                        $(datas).find("#villages").find("tr").each(function(key, val) {
                                                                if (Number($(val).find(".upgrade_building.b_watchtower").text()) > 0) {
                                                                        towerCoords.push($(val).find(".quickedit-label").text().match(/\d+\|\d+/)[0]);
                                                                        var level = Number($(val).find(".upgrade_building.b_watchtower").text());
                                                                        switch (level) {
                                                                                case 1:
                                                                                        towerLevels.push(1.1);
                                                                                        break;
                                                                                case 2:
                                                                                        towerLevels.push(1.3);
                                                                                        break;
                                                                                // additional levels up to case 20
                                                                                case 20:
                                                                                        towerLevels.push(15);
                                                                                        break;
                                                                        }
                                                                }
                                                        })
                                                        if (towerCoords.length == 0) {
                                                                UI.ErrorMessage("There are no watchtowers in any of your villages!", 5000)
                                                        }
                                                },
                                        })
                                },
                        })
                }
                var doStuff = function() {
                        intersectionPoints = [];
                        block = [];
                        $("#incomings_table").find("tr").eq(timesRun).find("td").last().after("<td></td>");
                        var distance = Number($("#incomings_table").find("tr").eq(timesRun).find("td").eq(4).text().trim());
                        var destination = $("#incomings_table").find("tr").eq(timesRun).find("td").eq(1).text().match(/\d+\|\d+/)[0];
                        var origin = $("#incomings_table").find("tr").eq(timesRun).find("td").eq(2).text().match(/\d+\|\d+/)[0];
                        var hms = $("#incomings_table").find("tr").eq(timesRun).find("td").eq(6).text().split(':'),
                                seconds = (+hms[0]) * 3600 + (+hms[1]) * 60 + (+hms[2]),
                                commandName = $("#incomings_table").find("tr").eq(timesRun).find("td").eq(0).text().trim().toLowerCase();

                        if (commandName.includes("sword")) {
                                var remainingFields = seconds / unitSpeed[0];
                        } else if (commandName.includes("sekerník")) {
                                var remainingFields = seconds / unitSpeed[1];
                        } else if (commandName.includes("špeh")) {
                                var remainingFields = seconds / unitSpeed[2];
                        } else if (commandName.includes("ljaz")) {
                                var remainingFields = seconds / unitSpeed[3];
                        } else if (commandName.includes("tj")) {
                                var remainingFields = seconds / unitSpeed[4];
                        } else if (commandName.includes("baranidlo")) {
                                var remainingFields = seconds / unitSpeed[5];
                        } else if (commandName.includes("šľachtic")) {
                                var remainingFields = seconds / unitSpeed[6];
                        }

                        var target = String(destination).split("|");
                        var source = String(origin).split("|");
                        var divisor = Number(target[0]) - Number(source[0]);
                        if (divisor == 0) {
                                divisor = 1;
                        }
                        var m = (Number(target[1]) - Number(source[1])) / (divisor);
                        var n = (m * Number(target[0]) - Number(target[1])) / -1;
                        for (var i = 0; i < towerCoords.length; i++) {
                                var h = (String(towerCoords[i]).split("|"))[0];
                                var k = (String(towerCoords[i]).split("|"))[1];
                                var r = towerLevels[i];
                                findCircleLineIntersections(r, h, k, m, n);
                        }

                        function findCircleLineIntersections(r, h, k, m, n) {
                                var a = 1 + Math.pow(m, 2);
                                var b = -h * 2 + (m * (n - k)) * 2;
                                var c = Math.pow(h, 2) + Math.pow(n - k, 2) - Math.pow(r, 2);
                                var d = Math.pow(b, 2) - 4 * a * c;
                                if (d >= 0) {
                                        var intersections = [
                                                (-b + Math.sqrt(d)) / 2 / a,
                                                (-b - Math.sqrt(d)) / 2 / a
                                        ];
                                        intersectionPoints.push((Number(intersections[0])) + "|" + (Number(m * intersections[0] + n)));
                                        intersectionPoints.push((Number(intersections[1])) + "|" + (Number(m * intersections[1] + n)));
                                }
                        }

                        if (intersectionPoints.length == 0) {
                                $("#incomings_table").find("tr").eq(timesRun).find("td").last().text("Nedetekovateľné").css({
                                        "font-weight": "bold",
                                        "color": "red"
                                });
                                ++timesRun
                                setTimeout(doStuff, 1);
                        }

                        for (var i = 0; i < intersectionPoints.length; i++) {
                                var intersections = intersectionPoints[i].split("|");
                                var originDistance = Math.sqrt((Math.pow((intersections[0] - source[0]), 2) + Math.pow((intersections[1] - source[1]), 2)));
                                block.push(originDistance);
                        }

                        idx = block.indexOf(Math.min.apply(null, block));
                        var nearest = intersectionPoints[idx];
                        var currentDistance = distance - remainingFields;
                        var M = nearest.split("|");
                        var remaining = Math.sqrt((Math.pow((M[0] - source[0]), 2) + Math.pow((M[1] - source[1]), 2))) - currentDistance;

                        if (commandName.includes("sekerník")) {
                                var sec = remaining * unitSpeed[1];
                        } else if (commandName.includes("špeh")) {
                                var sec = remaining * unitSpeed[2];
                        } else if (commandName.includes("ljaz")) {
                                var sec = remaining * unitSpeed[3];
                        } else if (commandName.includes("tj")) {
                                var sec = remaining * unitSpeed[4];
                        } else if (commandName.includes("baranidlo")) {
                                var sec = remaining * unitSpeed[5];
                        } else if (commandName.includes("šľachtic")) {
                                var sec = remaining * unitSpeed[6];
                        }

                        var myTimer;

                        function clock(x) {
                                myTimer = setInterval(myClock, 1000);

                                function myClock() {
                                        --sec
                                        var seconds = Math.floor(sec % 60);
                                        var minutes = Math.floor((sec / 60) % 60);
                                        var hours = Math.floor((sec / (60 * 60)));
                                        seconds = seconds < 10 ? "0" + seconds : seconds;
                                        minutes = minutes < 10 ? "0" + minutes : minutes;
                                        hours = hours < 10 ? "0" + hours : hours;
                                        time = hours + ":" + minutes + ":" + seconds;

                                        if (sec < 0) {
                                                var time = "Detekovaný";
                                                $("#incomings_table").find("tr").eq(x).find("td").last().text(time).css({
                                                        "font-weight": "bold",
                                                        "color": "green"
                                                });
                                        } else {
                                                var time = hours + ":" + minutes + ":" + seconds;
                                                $("#incomings_table").find("tr").eq(x).find("td").last().text(time).css("font-weight", "bold");
                                        }
                                        if (sec == 0) {
                                                clearInterval(myTimer);
                                        }
                                }
                        }
                        clock(timesRun);

                        if (++timesRun < rows + 1) {
                                doStuff();
                        }
                }
                $.ajax({url: url, success: function() {
                        $.ajax({
                                url: first(),
                                success: function() {
                                        doStuff();
                                }
                        })
                        }
                });
               
        } else {
                self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=overview_villages&mode=incomings&subtype=attacks");
        }
void(0);