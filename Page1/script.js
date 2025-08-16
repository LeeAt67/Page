// 目录列表交互功能
document.addEventListener("DOMContentLoaded", function () {
  // 全局变量
  const contextMenu = document.querySelector(".context-menu");
  let activeMoreOption = null;
  let activeChapterItem = null;

  // 检查context menu是否正确加载
  if (!contextMenu) {
    console.error("Context menu element not found!");
  }

  // 初始化目录列表
  initDirectoryList();

  /**
   * 设置更多选项按钮的事件监听
   * 使用事件委托避免重复绑定
   */
  function setupMoreOptionsEvents() {
    // 移除旧的事件监听器
    document.removeEventListener("click", handleMoreOptionsClick);

    // 使用事件委托，只在document上绑定一次
    document.addEventListener("click", handleMoreOptionsClick);
  }

  /**
   * 处理更多选项按钮点击事件
   * @param {Event} e - 点击事件
   */
  function handleMoreOptionsClick(e) {
    const moreOption = e.target.closest(".more-options");

    if (moreOption) {
      e.stopPropagation();

      // 记录当前激活的章节项
      activeChapterItem =
        moreOption.closest(".chapter-item") ||
        moreOption.closest(".section-item") ||
        moreOption.closest(".subsection-item");

      // 如果当前点击的是已激活的按钮，则隐藏菜单
      if (
        activeMoreOption === moreOption &&
        contextMenu.style.display === "block"
      ) {
        hideContextMenu();
        return;
      }

      // 显示上下文菜单
      showContextMenu(moreOption);
      activeMoreOption = moreOption;

      // 添加激活状态
      moreOption.classList.add("active");
    }
  }

  /**
   * 显示上下文菜单
   * @param {Element} targetElement - 触发菜单的元素
   */
  function showContextMenu(targetElement) {
    if (!contextMenu) {
      console.error("Context menu element not found!");
      return;
    }

    const rect = targetElement.getBoundingClientRect();

    // 计算菜单位置，确保不超出视口
    let left = rect.left - 80;
    let top = rect.bottom + 5;

    // 防止菜单超出左边界
    if (left < 0) {
      left = rect.right + 5;
    }

    // 防止菜单超出底部
    if (top + 100 > window.innerHeight) {
      top = rect.top - 100 - 5;
    }

    contextMenu.style.display = "block";
    contextMenu.style.left = left + "px";
    contextMenu.style.top = top + "px";
  }

  /**
   * 隐藏上下文菜单
   */
  function hideContextMenu() {
    if (contextMenu) {
      contextMenu.style.display = "none";

      // 移除激活状态
      if (activeMoreOption) {
        activeMoreOption.classList.remove("active");
      }

      activeMoreOption = null;
    }
  }

  // 初始化目录列表
  function initDirectoryList() {
    setupMoreOptionsEvents();
    setupContextMenuEvents();
    setupChapterEvents();
    setupChapterSelectionEvents();
  }

  /**
   * 设置章节选择事件
   * 点击章节内容概述激活章节
   */
  function setupChapterSelectionEvents() {
    // 移除旧的事件监听器
    document.removeEventListener("click", handleChapterSelectionClick);

    // 使用事件委托
    document.addEventListener("click", handleChapterSelectionClick);
  }

  /**
   * 处理章节选择点击事件
   * @param {Event} e - 点击事件
   */
  function handleChapterSelectionClick(e) {
    // 检查是否点击了章节描述部分
    const chapterDesc = e.target.closest(
      ".chapter-desc, .section-desc, .subsection-desc"
    );

    if (chapterDesc) {
      e.stopPropagation();

      // 获取章节项元素
      const chapterItem = chapterDesc.closest(
        ".chapter-item, .section-item, .subsection-item"
      );

      if (chapterItem) {
        // 激活选中的章节
        setActiveChapter(chapterItem);
      }
    }
  }

  /**
   * 设置激活章节
   * @param {Element} chapterElement - 章节元素
   */
  function setActiveChapter(chapterElement) {
    // 移除所有章节的激活状态
    const allChapters = document.querySelectorAll(
      ".chapter-item, .section-item, .subsection-item"
    );
    allChapters.forEach((chapter) => {
      chapter.classList.remove("active-chapter");
    });

    // 为当前章节添加激活状态
    chapterElement.classList.add("active-chapter");

    // 更新右侧编辑区域的显示
    updateEditingArea(chapterElement);
  }

  /**
   * 更新右侧编辑区域
   * @param {Element} chapterElement - 激活的章节元素
   */
  function updateEditingArea(chapterElement) {
    const chapterInfo = {
      element: chapterElement,
      type: getChapterType(chapterElement),
      title: getChapterTitle(chapterElement),
      number: getChapterNumber(chapterElement),
    };

    // 更新空章节区域的标题
    const emptyChapter = document.querySelector(".empty-chapter");
    if (emptyChapter) {
      const title = emptyChapter.querySelector("h3");
      const description = emptyChapter.querySelector("p");

      if (title) {
        title.textContent = `编写 ${chapterInfo.number} ${chapterInfo.title}`;
      }

      if (description) {
        description.textContent = `当前选中章节：${chapterInfo.number}，点击下方"编写本章节"开始编写内容`;
      }
    }

    console.log("激活章节:", chapterInfo);
  }

  // 设置上下文菜单事件
  function setupContextMenuEvents() {
    if (!contextMenu) {
      console.error("Context menu not found when setting up events!");
      return;
    }

    const menuItems = contextMenu.querySelectorAll(".menu-item");

    menuItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.stopPropagation();

        const action = this.textContent.trim();

        switch (action) {
          case "删除":
            if (activeChapterItem) {
              deleteItem(activeChapterItem);
            }
            break;
          case "章节设置":
            if (activeChapterItem) {
              openChapterSettings(activeChapterItem);
            }
            break;
          case "新增子章节":
            if (activeChapterItem) {
              addSubChapter(activeChapterItem);
            }
            break;
        }

        // 隐藏上下文菜单
        hideContextMenu();
      });
    });
  }

  // 获取上一个章节项
  function getPreviousChapterItem(element) {
    let current = element;
    while (current) {
      current = current.previousElementSibling;
      if (current && current.classList.contains("chapter-item")) {
        return current;
      }
    }
    return null;
  }

  // 获取上一个节项
  function getPreviousSectionItem(element) {
    let current = element;
    while (current) {
      current = current.previousElementSibling;
      if (current && current.classList.contains("section-item")) {
        return current;
      }
    }
    return null;
  }

  /**
   * 设置章节项事件
   * 使用事件委托优化性能并避免重复绑定
   */
  function setupChapterEvents() {
    // 移除旧的事件监听器
    document.removeEventListener("click", handleChapterTitleClick);

    // 使用事件委托
    document.addEventListener("click", handleChapterTitleClick);
  }

  /**
   * 处理章节标题点击事件
   * @param {Event} e - 点击事件
   */
  function handleChapterTitleClick(e) {
    const title = e.target.closest(".chapter-title, .section-title");

    if (title) {
      e.stopPropagation();

      const item =
        title.closest(".chapter-item") || title.closest(".section-item");
      if (!item) return;

      const children = getChildItems(item);

      if (children.length > 0) {
        toggleChildrenVisibility(children, title);
      }
    }
  }

  /**
   * 获取章节项的子项
   * @param {Element} item - 章节项元素
   * @returns {Array} 子项数组
   */
  function getChildItems(item) {
    const children = [];

    if (item.classList.contains("chapter-item")) {
      // 对于章节，查找紧跟其后直到下一个章节之前的所有节
      let nextItem = item.nextElementSibling;
      while (nextItem && !nextItem.classList.contains("chapter-item")) {
        if (nextItem.classList.contains("section-item")) {
          children.push(nextItem);
        }
        nextItem = nextItem.nextElementSibling;
      }
    } else if (item.classList.contains("section-item")) {
      // 对于节，检查是否有专门的小节列表容器
      const subsectionList = item.nextElementSibling;
      if (
        subsectionList &&
        subsectionList.classList.contains("subsection-list")
      ) {
        children.push(subsectionList);

        // 确保小节列表中的所有小节都有正确的显示样式
        Array.from(subsectionList.children).forEach((subsection) => {
          if (subsection.classList.contains("subsection-item")) {
            subsection.style.display = "flex";
          }
        });
      } else {
        // 查找紧跟其后直到下一个节或章节之前的所有小节
        let nextItem = item.nextElementSibling;
        while (
          nextItem &&
          !nextItem.classList.contains("section-item") &&
          !nextItem.classList.contains("chapter-item")
        ) {
          if (nextItem.classList.contains("subsection-item")) {
            children.push(nextItem);
          }
          nextItem = nextItem.nextElementSibling;
        }
      }
    }

    return children;
  }

  /**
   * 切换子项的显示状态
   * @param {Array} children - 子项数组
   * @param {Element} titleElement - 标题元素
   */
  function toggleChildrenVisibility(children, titleElement) {
    if (children.length === 0) return;

    const firstChild = children[0];
    const isVisible = firstChild.style.display !== "none";

    // 切换显示状态
    children.forEach((child) => {
      if (child.classList.contains("subsection-list")) {
        child.style.display = isVisible ? "none" : "block";
      } else {
        child.style.display = isVisible ? "none" : "flex";
      }
    });

    // 切换下拉图标方向
    const dropdownIcon = titleElement.querySelector(".dropdown-icon");
    if (dropdownIcon) {
      dropdownIcon.style.transform = isVisible
        ? "rotate(0deg)"
        : "rotate(180deg)";
    }
  }

  // 删除章节项
  function deleteItem(item) {
    // 确认删除
    if (confirm("确定要删除此章节吗？")) {
      // 如果是章节，需要同时删除其下的所有子节
      if (item.classList.contains("chapter-item")) {
        let nextItem = item.nextElementSibling;

        while (
          nextItem &&
          (nextItem.classList.contains("section-item") ||
            nextItem.classList.contains("subsection-item") ||
            nextItem.classList.contains("subsection-list"))
        ) {
          const itemToRemove = nextItem;
          nextItem = nextItem.nextElementSibling;
          itemToRemove.remove();
        }
      }

      // 删除当前项
      item.remove();
    }
  }

  // 打开章节设置
  function openChapterSettings(item) {
    // 这里可以实现打开章节设置的弹窗
    alert(
      "打开章节设置：" +
        item.querySelector(
          ".chapter-number, .section-number, .subsection-number"
        ).textContent
    );
  }

  /**
   * 添加子章节
   * @param {Element} item - 父章节项
   */
  function addSubChapter(item) {
    const subChapterInfo = getSubChapterInfo(item);

    if (!subChapterInfo) {
      return; // 小节不能再添加子章节
    }

    const { newItemType, newItemNumber } = subChapterInfo;
    const newItem = createSubChapterElement(newItemType, newItemNumber);

    insertSubChapterElement(item, newItem, newItemType);

    // 重新设置事件
    setupMoreOptionsEvents();
    setupChapterEvents();
  }

  /**
   * 获取子章节信息
   * @param {Element} item - 父章节项
   * @returns {Object|null} 子章节信息对象
   */
  function getSubChapterInfo(item) {
    if (item.classList.contains("chapter-item")) {
      return {
        newItemType: "section-item",
        newItemNumber: generateSectionNumber(item),
      };
    } else if (item.classList.contains("section-item")) {
      return {
        newItemType: "subsection-item",
        newItemNumber: generateSubsectionNumber(item),
      };
    }

    return null;
  }

  /**
   * 生成节编号
   * @param {Element} chapterItem - 章节项
   * @returns {string} 节编号
   */
  function generateSectionNumber(chapterItem) {
    const chapterNumber =
      chapterItem.querySelector(".chapter-number").textContent;
    const sectionCount = getSectionCount(chapterNumber);

    return convertNumberToChinese(sectionCount + 1, "节");
  }

  /**
   * 生成小节编号
   * @param {Element} sectionItem - 节项
   * @returns {string} 小节编号
   */
  function generateSubsectionNumber(sectionItem) {
    // 查找当前节后面的subsection-list
    let subsectionList = sectionItem.nextElementSibling;

    // 如果下一个元素不是subsection-list，继续查找
    while (
      subsectionList &&
      !subsectionList.classList.contains("subsection-list")
    ) {
      subsectionList = subsectionList.nextElementSibling;
    }

    let subsectionCount = 0;
    if (subsectionList) {
      // 计算当前subsection-list中的小节数量
      subsectionCount =
        subsectionList.querySelectorAll(".subsection-item").length;
    }

    const chineseNumbers = [
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
    ];
    return subsectionCount < chineseNumbers.length
      ? chineseNumbers[subsectionCount]
      : `${subsectionCount + 1}`;
  }

  /**
   * 将数字转换为中文编号
   * @param {number} num - 数字
   * @param {string} unit - 单位
   * @returns {string} 中文编号
   */
  function convertNumberToChinese(num, unit) {
    const chineseNumbers = [
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
    ];

    if (num <= chineseNumbers.length) {
      return `第${chineseNumbers[num - 1]}${unit}`;
    } else {
      return `第${num}${unit}`;
    }
  }

  /**
   * 获取章节下的节数量
   * @param {string} chapterNumber - 章节编号
   * @returns {number} 节数量
   */
  function getSectionCount(chapterNumber) {
    const allSections = document.querySelectorAll(".section-item");
    let count = 0;

    allSections.forEach((section) => {
      const parentChapter = getPreviousChapterItem(section);
      if (
        parentChapter &&
        parentChapter.querySelector(".chapter-number").textContent ===
          chapterNumber
      ) {
        count++;
      }
    });

    return count;
  }

  /**
   * 获取节下的小节数量
   * @param {string} chapterNumber - 章节编号
   * @param {string} sectionNumber - 节编号
   * @returns {number} 小节数量
   */
  function getSubsectionCount(chapterNumber, sectionNumber) {
    const allSubsections = document.querySelectorAll(".subsection-item");
    let count = 0;

    allSubsections.forEach((subsection) => {
      const parentSection = getPreviousSectionItem(subsection);
      if (
        parentSection &&
        parentSection.querySelector(".section-number").textContent ===
          sectionNumber
      ) {
        const parentChapter = getPreviousChapterItem(parentSection);
        if (
          parentChapter &&
          parentChapter.querySelector(".chapter-number").textContent ===
            chapterNumber
        ) {
          count++;
        }
      }
    });

    return count;
  }

  /**
   * 创建子章节元素
   * @param {string} itemType - 章节类型
   * @param {string} itemNumber - 章节编号
   * @returns {Element} 新创建的章节元素
   */
  function createSubChapterElement(itemType, itemNumber) {
    const newItem = document.createElement("div");
    newItem.className = itemType;

    // 设置子章节内容
    newItem.innerHTML = `
            <div class="${
              itemType === "section-item" ? "section-title" : "subsection-title"
            }">
                <div class="${
                  itemType === "section-item"
                    ? "section-number"
                    : "subsection-number"
                }">${itemNumber}</div>
                <div class="dropdown-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.27618 9.81824C7.31827 9.79394 7.36354 9.77614 7.40075 9.73891C7.40727 9.73079 7.41206 9.72437 7.41857 9.71787C7.42669 9.70818 7.43961 9.70494 7.44766 9.69682L11.8149 5.16619C11.9314 5.04646 11.9897 4.8911 11.9897 4.73576C11.9897 4.57394 11.925 4.4105 11.7987 4.28915C11.5512 4.05129 11.1579 4.05777 10.9201 4.30533L6.98166 8.39261L3.09991 4.28915C2.86366 4.03998 2.47046 4.02861 2.22129 4.26486C1.9721 4.50112 1.96074 4.89431 2.19699 5.14348L6.52216 9.7162C6.71143 9.91685 7.00271 9.95408 7.23896 9.84079C7.25188 9.83601 7.26326 9.82463 7.27618 9.81819V9.81824Z" fill="#8E93A6"/>
                    </svg>
                </div>
            </div>
            <div class="${
              itemType === "section-item" ? "section-desc" : "subsection-desc"
            }">章节内容概述</div>
            <div class="status-icon completed">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#4CAF50"/>
                    <path d="M6.5 10.5L4 8L3 9L6.5 12.5L13 6L12 5L6.5 10.5Z" fill="white"/>
                </svg>
            </div>
            <div class="more-options">
                <svg width="12" height="4" viewBox="0 0 12 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.3336 0.665649C0.6 0.665649 0 1.26565 0 1.99925C0 2.73205 0.6 3.33205 1.3336 3.33205C2.0664 3.33205 2.6664 2.73205 2.6664 1.99925C2.6664 1.26565 2.0664 0.665649 1.3336 0.665649ZM10.6664 0.665649C9.9336 0.665649 9.3336 1.26565 9.3336 1.99925C9.3336 2.73205 9.9336 3.33205 10.6664 3.33205C11.4 3.33205 12 2.73205 12 1.99925C12 1.26565 11.4 0.665649 10.6664 0.665649ZM6 0.665649C5.2664 0.665649 4.6664 1.26565 4.6664 1.99925C4.6664 2.73205 5.2664 3.33205 6 3.33205C6.7336 3.33205 7.3336 2.73205 7.3336 1.99925C7.3336 1.26565 6.7336 0.665649 6 0.665649Z" fill="black"/>
                </svg>
            </div>
        `;

    return newItem;
  }

  /**
   * 插入子章节元素到合适的位置
   * @param {Element} parentItem - 父章节项
   * @param {Element} newItem - 新子章节元素
   * @param {string} itemType - 章节类型
   */
  function insertSubChapterElement(parentItem, newItem, itemType) {
    if (itemType === "subsection-item") {
      let subsectionList = parentItem.nextElementSibling;

      if (
        !subsectionList ||
        !subsectionList.classList.contains("subsection-list")
      ) {
        // 创建新的小节列表
        subsectionList = document.createElement("div");
        subsectionList.className = "subsection-list";
        subsectionList.style.display = "block";

        // 插入到当前节之后
        parentItem.parentNode.insertBefore(
          subsectionList,
          parentItem.nextSibling
        );
      }

      // 将新小节添加到小节列表中
      subsectionList.appendChild(newItem);
    } else {
      // 处理节的插入
      const insertPosition = findInsertPosition(parentItem);
      parentItem.parentNode.insertBefore(newItem, insertPosition);
    }
  }

  /**
   * 查找插入位置
   * @param {Element} parentItem - 父章节项
   * @returns {Element|null} 插入位置
   */
  function findInsertPosition(parentItem) {
    if (parentItem.classList.contains("chapter-item")) {
      // 找到当前章节下的最后一个节
      let lastSectionOfChapter = null;
      let nextItem = parentItem.nextElementSibling;

      while (nextItem && !nextItem.classList.contains("chapter-item")) {
        if (nextItem.classList.contains("section-item")) {
          lastSectionOfChapter = nextItem;
        }
        nextItem = nextItem.nextElementSibling;
      }

      if (lastSectionOfChapter) {
        // 检查最后一个节是否有小节列表
        let insertAfter = lastSectionOfChapter;
        let subsectionList = lastSectionOfChapter.nextElementSibling;

        if (
          subsectionList &&
          subsectionList.classList.contains("subsection-list")
        ) {
          insertAfter = subsectionList;
        }

        return insertAfter.nextSibling;
      } else {
        // 如果没有找到节，直接在章节后插入
        return parentItem.nextSibling;
      }
    }

    return parentItem.nextSibling;
  }

  // 点击其他地方隐藏上下文菜单
  document.addEventListener("click", function () {
    hideContextMenu();
  });

  /**
   * 设置按钮事件监听
   */
  function setupButtonEvents() {
    const buttonHandlers = {
      ".write-btn": () => openChapterWritingModal(),
      ".one-click-btn": () => alert("开始一键编写全文"),
      ".prev-btn": () => alert("返回上一步"),
      ".next-btn": () => alert("进入下一步"),
    };

    Object.entries(buttonHandlers).forEach(([selector, handler]) => {
      const button = document.querySelector(selector);
      if (button) {
        button.addEventListener("click", handler);
      }
    });

    // 表头按钮点击事件
    const headerItems = document.querySelectorAll(".header-item");
    headerItems.forEach((item) => {
      item.addEventListener("click", function () {
        const action = this.textContent.trim();

        switch (action) {
          case "返回":
            alert("返回上一级");
            break;
          case "编辑":
            alert("编辑项目名称");
            break;
        }
      });
    });
  }

  // 延迟初始化，确保所有元素都已加载
  setTimeout(() => {
    // 页面加载时默认激活第一个章节
    initializeDefaultChapter();

    // 恢复保存的章节内容
    restoreSavedChapterContents();

    // 初始化按钮事件
    setupButtonEvents();
  }, 100);

  /**
   * 恢复保存的章节内容
   * 页面加载时检查localStorage中的内容并显示在对应章节
   */
  function restoreSavedChapterContents() {
    const allChapters = document.querySelectorAll(
      ".chapter-item, .section-item, .subsection-item"
    );

    allChapters.forEach((chapterElement) => {
      const chapterInfo = {
        element: chapterElement,
        type: getChapterType(chapterElement),
        title: getChapterTitle(chapterElement),
        number: getChapterNumber(chapterElement),
      };

      // 检查是否有保存的内容
      const finalKey = `chapter_${chapterInfo.type}_${chapterInfo.number}_final`;
      const draftKey = `chapter_${chapterInfo.type}_${chapterInfo.number}_draft`;

      const finalContent = localStorage.getItem(finalKey);
      const draftContent = localStorage.getItem(draftKey);

      if (finalContent && finalContent.trim() !== "") {
        // 有正式内容
        updateChapterContentDisplay(chapterInfo, finalContent, false);
        updateChapterStatus(chapterElement, "completed");
      } else if (draftContent && draftContent.trim() !== "") {
        // 只有草稿内容
        updateChapterContentDisplay(chapterInfo, draftContent, true);
        updateChapterStatus(chapterElement, "draft");
      }
    });
  }

  /**
   * 初始化默认激活章节
   */
  function initializeDefaultChapter() {
    const firstChapter = document.querySelector(".chapter-item");
    if (firstChapter) {
      setActiveChapter(firstChapter);
    }
  }

  /**
   * 打开章节编写弹窗
   */
  function openChapterWritingModal() {
    // 获取当前选中的章节
    let selectedChapter = getCurrentSelectedChapter();

    if (!selectedChapter) {
      // 如果没有选中章节，尝试激活第一个章节
      const firstChapter = document.querySelector(".chapter-item");
      if (firstChapter) {
        setActiveChapter(firstChapter);
        selectedChapter = getCurrentSelectedChapter();
      }

      if (!selectedChapter) {
        alert("请先点击左侧章节内容概述来选择要编写的章节");
        return;
      }
    }

    // 直接打开编写界面
    showChapterWritingInterface(selectedChapter);
  }

  /**
   * 获取当前选中的章节
   * @returns {Object|null} 章节信息对象
   */
  function getCurrentSelectedChapter() {
    // 查找是否有激活的章节
    const activeItem = document.querySelector(
      ".chapter-item.active-chapter, .section-item.active-chapter, .subsection-item.active-chapter"
    );

    if (activeItem) {
      return {
        element: activeItem,
        type: getChapterType(activeItem),
        title: getChapterTitle(activeItem),
        number: getChapterNumber(activeItem),
      };
    }

    // 如果没有激活的章节，查找是否有标记为选中的章节
    const selectedItem = document.querySelector(
      ".chapter-item.selected, .section-item.selected, .subsection-item.selected"
    );

    if (selectedItem) {
      return {
        element: selectedItem,
        type: getChapterType(selectedItem),
        title: getChapterTitle(selectedItem),
        number: getChapterNumber(selectedItem),
      };
    }

    return null; // 不再默认选择第一个章节，需要用户主动选择
  }

  /**
   * 获取章节类型
   * @param {Element} element - 章节元素
   * @returns {string} 章节类型
   */
  function getChapterType(element) {
    if (element.classList.contains("chapter-item")) return "chapter";
    if (element.classList.contains("section-item")) return "section";
    if (element.classList.contains("subsection-item")) return "subsection";
    return "unknown";
  }

  /**
   * 获取章节标题
   * @param {Element} element - 章节元素
   * @returns {string} 章节标题
   */
  function getChapterTitle(element) {
    const descElement = element.querySelector(
      ".chapter-desc, .section-desc, .subsection-desc"
    );
    return descElement ? descElement.textContent.trim() : "未命名章节";
  }

  /**
   * 获取章节编号
   * @param {Element} element - 章节元素
   * @returns {string} 章节编号
   */
  function getChapterNumber(element) {
    const numberElement = element.querySelector(
      ".chapter-number, .section-number, .subsection-number"
    );
    return numberElement ? numberElement.textContent.trim() : "";
  }

  /**
   * 显示章节选择弹窗
   */
  function showChapterSelectionModal() {
    // 创建弹窗遮罩
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "chapter-modal-overlay";

    // 创建弹窗容器
    const modalContainer = document.createElement("div");
    modalContainer.className = "chapter-modal-container";

    modalContainer.innerHTML = `
      <div class="chapter-modal-header">
        <h3>选择要编写的章节</h3>
        <button class="chapter-modal-close">&times;</button>
      </div>
      <div class="chapter-modal-body">
        <div class="chapter-selection-list">
          ${generateChapterSelectionList()}
        </div>
      </div>
      <div class="chapter-modal-footer">
        <button class="btn-cancel">取消</button>
        <button class="btn-confirm" disabled>开始编写</button>
      </div>
    `;

    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // 设置弹窗事件
    setupChapterSelectionEvents(modalOverlay);

    // 显示弹窗
    modalOverlay.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  /**
   * 生成章节选择列表HTML
   * @returns {string} HTML字符串
   */
  function generateChapterSelectionList() {
    const chapters = document.querySelectorAll(
      ".chapter-item, .section-item, .subsection-item"
    );
    let html = "";

    chapters.forEach((chapter, index) => {
      const type = getChapterType(chapter);
      const title = getChapterTitle(chapter);
      const number = getChapterNumber(chapter);
      const indent =
        type === "section"
          ? 'style="margin-left: 20px;"'
          : type === "subsection"
          ? 'style="margin-left: 40px;"'
          : "";

      html += `
        <div class="chapter-selection-item" data-index="${index}" ${indent}>
          <input type="radio" name="selectedChapter" value="${index}" id="chapter_${index}">
          <label for="chapter_${index}">
            <span class="chapter-number">${number}</span>
            <span class="chapter-title">${title}</span>
          </label>
        </div>
      `;
    });

    return html;
  }

  /**
   * 设置章节选择弹窗事件
   * @param {Element} modalOverlay - 弹窗遮罩元素
   */
  function setupChapterSelectionEvents(modalOverlay) {
    const confirmBtn = modalOverlay.querySelector(".btn-confirm");
    const cancelBtn = modalOverlay.querySelector(".btn-cancel");
    const closeBtn = modalOverlay.querySelector(".chapter-modal-close");
    const radioButtons = modalOverlay.querySelectorAll(
      'input[name="selectedChapter"]'
    );

    // 章节选择事件
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", function () {
        confirmBtn.disabled = false;
      });
    });

    // 确认按钮事件
    confirmBtn.addEventListener("click", function () {
      const selectedRadio = modalOverlay.querySelector(
        'input[name="selectedChapter"]:checked'
      );
      if (selectedRadio) {
        const chapterIndex = parseInt(selectedRadio.value);
        const chapters = document.querySelectorAll(
          ".chapter-item, .section-item, .subsection-item"
        );
        const selectedChapter = {
          element: chapters[chapterIndex],
          type: getChapterType(chapters[chapterIndex]),
          title: getChapterTitle(chapters[chapterIndex]),
          number: getChapterNumber(chapters[chapterIndex]),
        };

        // 关闭选择弹窗
        closeChapterSelectionModal(modalOverlay);

        // 打开编写界面
        showChapterWritingInterface(selectedChapter);
      }
    });

    // 取消和关闭按钮事件
    [cancelBtn, closeBtn].forEach((btn) => {
      btn.addEventListener("click", () =>
        closeChapterSelectionModal(modalOverlay)
      );
    });

    // 点击遮罩关闭
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        closeChapterSelectionModal(modalOverlay);
      }
    });
  }

  /**
   * 关闭章节选择弹窗
   * @param {Element} modalOverlay - 弹窗遮罩元素
   */
  function closeChapterSelectionModal(modalOverlay) {
    document.body.style.overflow = "auto";
    modalOverlay.remove();
  }

  /**
   * 显示章节编写界面
   * @param {Object} chapterInfo - 章节信息
   */
  function showChapterWritingInterface(chapterInfo) {
    // 创建编写界面弹窗
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "writing-modal-overlay";

    const modalContainer = document.createElement("div");
    modalContainer.className = "writing-modal-container";

    modalContainer.innerHTML = `
      <div class="writing-modal-header">
        <h3>编写章节：${chapterInfo.number} ${chapterInfo.title}</h3>
        <button class="writing-modal-close">&times;</button>
      </div>
      <div class="writing-modal-body">
        <div class="writing-toolbar">
          <button class="toolbar-btn" data-action="bold">粗体</button>
          <button class="toolbar-btn" data-action="italic">斜体</button>
          <button class="toolbar-btn" data-action="underline">下划线</button>
          <button class="toolbar-btn" data-action="insertUnorderedList">列表</button>
        </div>
        <div class="writing-content">
          <div class="content-editor" contenteditable="true" placeholder="请输入章节内容...">
            ${getChapterCurrentContent(chapterInfo)}
          </div>
        </div>
      </div>
      <div class="writing-modal-footer">
        <button class="btn-save-draft">保存草稿</button>
        <button class="btn-cancel">取消</button>
        <button class="btn-save">保存</button>
      </div>
    `;

    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // 设置编写界面事件
    setupWritingInterfaceEvents(modalOverlay, chapterInfo);

    // 显示弹窗
    modalOverlay.style.display = "block";
    document.body.style.overflow = "hidden";

    // 聚焦到编辑器
    const editor = modalContainer.querySelector(".content-editor");
    editor.focus();
  }

  /**
   * 获取章节当前内容
   * @param {Object} chapterInfo - 章节信息
   * @returns {string} 章节内容
   */
  function getChapterCurrentContent(chapterInfo) {
    // 从本地存储获取章节内容
    const storageKey = `chapter_${chapterInfo.type}_${chapterInfo.number}_final`;
    const draftKey = `chapter_${chapterInfo.type}_${chapterInfo.number}_draft`;

    // 优先获取正式版本，如果没有则获取草稿版本
    const savedContent =
      localStorage.getItem(storageKey) || localStorage.getItem(draftKey);

    if (savedContent && savedContent.trim() !== "") {
      return savedContent;
    }

    // 如果没有保存的内容，返回默认提示
    return `<p>开始编写 ${chapterInfo.number} 的内容...</p>`;
  }

  /**
   * 设置编写界面事件
   * @param {Element} modalOverlay - 弹窗遮罩元素
   * @param {Object} chapterInfo - 章节信息
   */
  function setupWritingInterfaceEvents(modalOverlay, chapterInfo) {
    const closeBtn = modalOverlay.querySelector(".writing-modal-close");
    const cancelBtn = modalOverlay.querySelector(".btn-cancel");
    const saveBtn = modalOverlay.querySelector(".btn-save");
    const saveDraftBtn = modalOverlay.querySelector(".btn-save-draft");
    const toolbarBtns = modalOverlay.querySelectorAll(".toolbar-btn");
    const editor = modalOverlay.querySelector(".content-editor");

    // 工具栏按钮事件
    toolbarBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = this.dataset.action;
        document.execCommand(action, false, null);
        editor.focus();
      });
    });

    // 保存按钮事件
    saveBtn.addEventListener("click", function () {
      const content = editor.innerHTML;
      saveChapterContent(chapterInfo, content, false);
      closeWritingModal(modalOverlay);
    });

    // 保存草稿按钮事件
    saveDraftBtn.addEventListener("click", function () {
      const content = editor.innerHTML;
      saveChapterContent(chapterInfo, content, true);
      showSaveMessage("草稿已保存");
    });

    // 取消和关闭按钮事件
    [cancelBtn, closeBtn].forEach((btn) => {
      btn.addEventListener("click", () => {
        if (hasUnsavedChanges(editor)) {
          if (confirm("有未保存的更改，确定要关闭吗？")) {
            closeWritingModal(modalOverlay);
          }
        } else {
          closeWritingModal(modalOverlay);
        }
      });
    });

    // 点击遮罩关闭
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        if (hasUnsavedChanges(editor)) {
          if (confirm("有未保存的更改，确定要关闭吗？")) {
            closeWritingModal(modalOverlay);
          }
        } else {
          closeWritingModal(modalOverlay);
        }
      }
    });
  }

  /**
   * 检查是否有未保存的更改
   * @param {Element} editor - 编辑器元素
   * @returns {boolean} 是否有未保存的更改
   */
  function hasUnsavedChanges(editor) {
    // 简单检查：如果内容不是初始内容就认为有更改
    const currentContent = editor.innerHTML;
    const initialContent = getChapterCurrentContent(
      getCurrentSelectedChapter()
    );
    return currentContent !== initialContent;
  }

  /**
   * 保存章节内容
   * @param {Object} chapterInfo - 章节信息
   * @param {string} content - 章节内容
   * @param {boolean} isDraft - 是否为草稿
   */
  function saveChapterContent(chapterInfo, content, isDraft = false) {
    // 将内容保存到本地存储
    const storageKey = `chapter_${chapterInfo.type}_${chapterInfo.number}_${
      isDraft ? "draft" : "final"
    }`;
    localStorage.setItem(storageKey, content);

    // 更新章节状态显示
    updateChapterStatus(chapterInfo.element, isDraft ? "draft" : "completed");

    // 更新章节内容显示
    updateChapterContentDisplay(chapterInfo, content, isDraft);

    console.log(`章节内容已${isDraft ? "保存为草稿" : "保存"}:`, {
      chapter: chapterInfo.number,
      contentLength: content.length,
      isDraft,
    });
  }

  /**
   * 更新章节内容显示
   * @param {Object} chapterInfo - 章节信息
   * @param {string} content - 章节内容
   * @param {boolean} isDraft - 是否为草稿
   */
  function updateChapterContentDisplay(chapterInfo, content, isDraft = false) {
    const chapterElement = chapterInfo.element;

    // 获取或创建内容预览区域
    let contentPreview = chapterElement.querySelector(
      ".chapter-content-preview"
    );

    if (!contentPreview) {
      // 创建内容预览区域
      contentPreview = document.createElement("div");
      contentPreview.className = "chapter-content-preview";

      // 添加到章节元素的末尾
      chapterElement.appendChild(contentPreview);
    }

    // 提取纯文本内容作为预览
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // 显示内容预览（限制长度）
    const previewText =
      textContent.length > 120
        ? textContent.substring(0, 120) + "..."
        : textContent;

    if (previewText.trim() && !previewText.includes("开始编写")) {
      contentPreview.textContent = previewText;
      contentPreview.style.display = "block";

      // 添加草稿或完成标识
      contentPreview.title = isDraft
        ? "草稿内容（点击查看完整内容）"
        : "已完成内容（点击查看完整内容）";

      // 添加点击事件，点击预览可以打开编辑界面
      contentPreview.onclick = function (e) {
        e.stopPropagation();
        // 先激活该章节
        setActiveChapter(chapterElement);
        // 然后打开编写界面
        setTimeout(() => {
          openChapterWritingModal();
        }, 100);
      };
    } else {
      contentPreview.style.display = "none";
    }
  }

  /**
   * 更新章节状态
   * @param {Element} chapterElement - 章节元素
   * @param {string} status - 状态 (draft, completed, error)
   */
  function updateChapterStatus(chapterElement, status) {
    const statusIcon = chapterElement.querySelector(".status-icon");
    if (statusIcon) {
      statusIcon.className = `status-icon ${status}`;
    }
  }

  /**
   * 显示保存消息
   * @param {string} message - 消息内容
   */
  function showSaveMessage(message) {
    // 创建临时提示消息
    const messageEl = document.createElement("div");
    messageEl.className = "save-message";
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 10000;
      animation: fadeInOut 3s ease-in-out;
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  /**
   * 关闭编写弹窗
   * @param {Element} modalOverlay - 弹窗遮罩元素
   */
  function closeWritingModal(modalOverlay) {
    document.body.style.overflow = "auto";
    modalOverlay.remove();
  }
});
