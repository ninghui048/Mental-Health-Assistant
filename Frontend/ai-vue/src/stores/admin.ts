// 管理员模块 状态管理
import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义一个管理员模块的状态管理
// 具名导出，可以使用 import {} 形式
export const useAdminStore = defineStore('admin',()=>{
    // 管理员模块的状态
    const isCollapsed = ref(false); 
    const toggleCollapsed = ()=>{
        isCollapsed.value = !isCollapsed.value;
    }
    return {
        isCollapsed,
        toggleCollapsed,
    }
});
// 默认导出，不能使用 import {} 形式
// export default useAdminStore;