<template>
    <div class="setting">
        <h1>合约地址白名单管理</h1>
        <el-table 
         :data="tableData"
         height="250"
         border
         style="width: 90%"
        >
            <el-table-column
            prop="address"
            label="合约地址">
            </el-table-column>
            <el-table-column label="操作" width="100%" fixed="right">
                <template slot-scope="scope">
                    <el-button @click.native.prevent="delete(scope.row)" type="text" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        name: 'WhitelistPage',
        data() {
            return {
                tableData: [
                    {
                        address: 'jfsljfsdfds'
                    }
                ]
            }
        },
        methods: {
            delete(row) {
                console.log(row, '000');
            }
        }
    }

</script>

<style scoped>
    .setting {
        color: #fff;
    }

</style>