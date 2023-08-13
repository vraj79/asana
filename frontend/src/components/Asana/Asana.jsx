import React, { useEffect, useState } from "react";
import moment from "moment";
import Timeline, {
  TimelineMarkers,
  TodayMarker,
} from "react-calendar-timeline";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import "react-calendar-timeline/lib/Timeline.css";
import "./Asana.css";
import axios from "axios";

const keys = {
  groupIdKey: "id",
  groupTitleKey: "title",
  groupRightTitleKey: "rightTitle",
  itemIdKey: "id",
  itemTitleKey: "title",
  itemDivTitleKey: "title",
  itemGroupKey: "group",
  itemTimeStartKey: "start",
  itemTimeEndKey: "end",
  groupLabelKey: "title",
};

const Asana = () => {
  const currentDate = new Date();
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);

  const getItems = async () => {
    try {
      let res = await axios.get("http://localhost:8080/api/task");
      console.log("API Response for Tasks:", res.data);
      const formattedTasks = res.data.map((task) => ({
        id: task._id,
        title: task.title,
        className: task.className,
        group: task.group, // Parse the group ID as an integer
        start: moment(task.start),
        end: moment(task.end),
      }));
      console.log("Formatted Tasks:", formattedTasks);
      setItems(formattedTasks);
    } catch (error) {
      console.error("Error fetching Tasks:", error);
    }
  };

  const getGroups = async () => {
    try {
      let res = await axios.get("http://localhost:8080/api/section");
      // console.log("API Response for Groups:", res.data);
      const formattedGroups = res.data.map((group) => ({
        id: group._id,
        title: group.title,
      }));
      // console.log("Formatted Groups:", formattedGroups);
      setGroups(formattedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  useEffect(() => {
    getItems();
  }, []);

  const itemRender = ({ item, itemContext, getItemProps, getResizeProps }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    const backgroundColor = itemContext.selected
      ? itemContext.dragging
        ? "red"
        : item.selectedBgColor
      : item.bgColor;
    const borderColor = itemContext.resizing ? "red" : item.color;
    return (
      <div
        {...getItemProps({
          style: {
            backgroundColor,
            color: item.color,
            borderColor,
            border: itemContext.selected
              ? "dashed 1px rgba(0,0,0,0.3)"
              : "none",
            borderRadius: 4,
            boxShadow: `0 1px 5px 0 rgba(0, 0, 0, 0.2),
                       0 2px 2px 0 rgba(0, 0, 0, 0.14),
                       0 3px 1px -2px rgba(0, 0, 0, 0.12)`,
          },
          // onMouseDown: () => {
          //   console.log("on item click", item);
          // },
        })}
      >
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

        <div
          className={`ripple`}
          style={{
            height: itemContext.dimensions.height,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "1rem",
          }}
        >
          {itemContext.title}
        </div>

        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
      </div>
    );
  };

  const handleItemMove = async (itemId, dragTime, newGroupOrder) => {
    const group = groups[newGroupOrder];

    const updatedItem = items?.find((item) => item.id === itemId);
    if (updatedItem) {
      const updatedStart = moment(dragTime);
      const updatedEnd = moment(dragTime).add(
        updatedItem?.end?.diff(updatedItem.start)
      );

      try {
        // Update item data in the database
        await axios.patch(`http://localhost:8080/api/task/${itemId}`, {
          start: updatedStart,
          end: updatedEnd,
        });
        console.log(
          "Updated item in the database:",
          itemId,
          updatedStart,
          updatedEnd
        );

        // Fetch updated items data from the API
        await getItems();
      } catch (error) {
        console.error("Error updating item in the database:", error);
      }
    }

    // Update local state with new item data
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              start: moment(dragTime),
              end: moment(dragTime + (item.end - item.start)),
              group: group.id,
            }
          : item
      )
    );

    try {
      await axios.patch(`http://localhost:8080/api/task/${itemId}`, {
        group: group.id,
      });
      console.log("Item's group updated in the database:", itemId, group.id);
    } catch (error) {
      console.error("Error updating item's group in the database:", error);
    }
    console.log("Moved", itemId, dragTime, newGroupOrder);
  };

  const handleItemResize = async (itemId, time, edge) => {
    const updatedItem = items.find((item) => item.id === itemId);
    if (updatedItem) {
      const updatedStart = edge === "left" ? time : moment(updatedItem.start);
      const updatedEnd = edge === "left" ? moment(updatedItem.end) : time;

      try {
        // Update item data in the database
        await axios.patch(`http://localhost:8080/api/task/${itemId}`, {
          start: updatedStart,
          end: updatedEnd,
        });
        console.log(
          "Updated item in the database:",
          itemId,
          updatedStart,
          updatedEnd
        );

        // Fetch updated items data from the API
        await getItems();
      } catch (error) {
        console.error("Error updating item in the database:", error);
      }
    }

    // Update local state with new item data
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              start: edge === "left" ? time : item.start,
              end: edge === "left" ? item.end : time,
            }
          : item
      )
    );

    console.log("Resized", itemId, time, edge);
  };

  const [showInput, setShowInput] = useState(false);
  const [addVal, setAddVal] = useState("");
  const [inputPlaceholder, setInputPlaceholder] = useState("");

  const currentInpDate = new Date();
  const [startDate, setStartDate] = useState(currentInpDate);
  const [endDate, setEndDate] = useState(currentInpDate);
  const [dependencies, setDependencies] = useState("");

  const handleSection = async (e) => {
    e.preventDefault();
    if (inputPlaceholder === "Add Section") {
      await axios.post("http://localhost:8080/api/section", {
        title: addVal,
        groupNum: groups.length + 1,
      });
      getGroups();
    } else {
      if (groups.length === 0) {
        alert("add section firs");
        return;
      }
      const techStack = ["htmlCss", "js2", "js3", "nodejs", "mySql", "react"];
      const randomValue =
        techStack[Math.floor(Math.random() * techStack.length)];
      const newTask = {
        title: addVal,
        group: groups[0]?.id,
        className: randomValue,
        start: moment(startDate),
        end: moment(endDate),
      };

      await axios.post("http://localhost:8080/api/task", newTask);
      // setItems([...items, newTask]);
      getItems();
      setStartDate("");
      setEndDate("");
    }
    setShowInput(false);
    setInputPlaceholder("");
    setAddVal("");
    setDependencies("");
  };

  const handleDeleteGroup = async (groupId) => {
    // Identify the items that belong to the group being deleted
    const itemsToDelete = items.filter((item) => item.group === groupId);

    // Delete each item one by one
    for (const itemToDelete of itemsToDelete) {
      try {
        await axios.delete(`http://localhost:8080/api/task/${itemToDelete.id}`);
        // Filter out the deleted item from the items state
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemToDelete.id)
        );
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }

    // Finally, delete the group
    await axios.delete(`http://localhost:8080/api/section/${groupId}`);
    // Update the groups state by filtering out the deleted group
    setGroups((prevGroups) =>
      prevGroups.filter((group) => group.id !== groupId)
    );
  };

  return (
    <>
      {showInput && (
        <form onSubmit={handleSection} className="addForm">
          <input
            type="text"
            required
            value={addVal}
            placeholder={inputPlaceholder}
            onChange={(e) => setAddVal(e.target.value)}
          />
          {inputPlaceholder === "Add Task" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                min={currentDate.toISOString().split("T")[0]}
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                max={new Date()}
                placeholder="End Date"
              />
            </>
          )}
          <input type="submit" value="Submit" />
        </form>
      )}
      <Timeline
        keys={keys}
        groups={groups}
        items={items}
        sidebarContent={
          <div className="sidebarHeader">
            <button
              style={{ display: "flex", alignItems: "center", gap: "0.5vmax" }}
              onClick={() => (
                setShowInput(!showInput), setInputPlaceholder("Add Task")
              )}
            >
              <AddIcon className="addIcon" /> Add Task
            </button>
            <button
              style={{ display: "flex", alignItems: "center", gap: "0.5vmax" }}
              onClick={() => (
                setShowInput(!showInput), setInputPlaceholder("Add Section")
              )}
            >
              <AddIcon className="addIcon" />
              Add Section
            </button>
          </div>
        }
        groupRenderer={({ group }) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5vmax",
              justifyContent: "center",
            }}
          >
            {group.title}
            <DeleteIcon
              className="deleteIcon"
              onClick={() => handleDeleteGroup(group.id)}
            />
          </div>
        )}
        lineHeight={75}
        itemRenderer={itemRender}
        defaultTimeStart={moment().startOf("day")} // Set to the start of the current day
        defaultTimeEnd={moment(currentDate).add(1, "month")}
        fullUpdate
        itemTouchSendsClick={false}
        stackItems
        itemHeightRatio={0.75}
        showCursorLine
        canMove={true}
        canResize={"both"}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
      >
        <TimelineMarkers>
          <TodayMarker>
            {({ styles, date }) => (
              <div
                style={{
                  ...styles,
                  width: "0.5rem",
                  backgroundColor: "rgba(255,0,0,0.5)",
                }}
              />
            )}
          </TodayMarker>
        </TimelineMarkers>
      </Timeline>
    </>
  );
};

export default Asana;
