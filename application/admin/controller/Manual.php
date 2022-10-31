<?php

namespace app\admin\controller;

use app\admin\model\Inspection;
use app\admin\model\Staff as StaffModel;
use app\common\controller\Backend;
use think\Cache;
use think\Db;
use think\Exception;
use think\exception\PDOException;
use think\exception\ValidateException;
use think\Model;


/**
 * 巡检
 *
 * @icon fa fa-circle-o
 */
class Manual extends Backend
{

    /**
     * Inspection模型对象
     * @var \app\admin\model\Inspection
     */
    protected $model       = null;
    protected $noNeedRight = ['getManualInfo']; //无需鉴权的方法,但需要登录


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Manual();
    }

    public function import()
    {
        parent::import();
    }


    public function index()
    {
        if ($this->request->isPost()) {

            $request = $this->request->post();
            $id      = $request['manual_id'];
            $params  = [];

            if ($request['From']) {
                //处理前端数据
                foreach ($request['From'] as $key =>  $value){

                    if(is_array($value)){
                        foreach ($value as $kk => $vv){
                            if(strlen($vv) < 1){
                                unset($request['From'][$key][$kk]);
                            }
                        }

                        $params[$key] = implode(',',array_unique($request['From'][$key]));
                    }else{
                        $params[$key] = $value;
                    }


                }


                if(!Db::name('manual')->where(['id'=>$id])->value('inspection_time')){
                    $params['inspection_time'] = date('Y-m-d H:i:s');
                }

                $params['update_time']  = date('Y-m-d H:i:s');

                $result = Db::name('manual')->where(['id'=>$id])->update($params);

                if ($result !== false) {

                    $this->success('录入信息完成');
                } else {
                    $this->error(__('No rows were updated'));
                }
            }else{
                $this->error(__('Parameter %s can not be empty', ''));
            }

        }

        $this->assign('id',$this->request->param('manual_id'));
        $this->assign('inspection_id',$this->request->param('inspection_id'));

        return $this->view->fetch();


    }

    public function getManualInfo(){

        $manualModel     = new \app\admin\model\Manual();
        $inspectionModel = new Inspection();
        $manual_id       = $this->request->param('manual_id');
        $inspection_id   = $this->request->param('inspection_id');

        //获取相同建筑物的信息
        $house_id     = ($inspectionModel->get($inspection_id))->house_id;
        $inspectData  = $inspectionModel->get(['house_id'=>$house_id,'confirm_completion'=>1,'confirm_audit'=>1,'status'=>1]);
        $getManual_id = !empty($inspectData) ? $inspectData->manual_id : '';

        if($getManual_id){
            $getManual = Db::name('manual')->where(['id'=>$getManual_id])->find();


            $manualModel->where(['id'=>$manual_id])->update([
                'build_name'         => $getManual['build_name'],
                'build_address'      => $getManual['build_address'],
                'build_era'          => $getManual['build_era'],
                'build_use'          => $getManual['build_use'],
                'change'             => $getManual['change'],
                'build_area'         => $getManual['build_area'],
                'build_layer_up'     => $getManual['build_layer_up'],
                'build_layer_down'   => $getManual['build_layer_down'],
                'build_add_layer'    => $getManual['build_add_layer'],
                'build_change'       => $getManual['build_change'],
                'build_place'        => $getManual['build_place'],
                'build_env'          => $getManual['build_env'],
                'build_his_disaster' => $getManual['build_his_disaster'],
                'build_repair'       => $getManual['build_repair'],
                'build_structure'    => $getManual['build_structure'],
                'build_identify'     => $getManual['build_identify'],
                'update_time'        => date('Y-m-d H:i:s')
            ]);

        }

        $result = Db::name('manual')->where(['id'=>$manual_id])->find();



        $data = [
            'change'              => $manualModel->change,
            'build_change'        => $manualModel->buildChange,
            'build_place'         => $manualModel->buildPlace,
            'build_env'           => $manualModel->buildEnv,
            'build_his_disaster'  => $manualModel->buildHisDisaster,
            'build_repair'        => $manualModel->buildRepair,
            'build_structure'     => $manualModel->buildStructure,
            'build_identify'      => $manualModel->buildIdentify,
            'survey_ground'       => $manualModel->surveyGround,
            'survey_floor'        => $manualModel->surveyFloor,
            'survey_floor_other'  => $manualModel->surveyOther,
            'survey_floor_morph'  => $manualModel->surveyMorph,
            'survey_floor_crack'  => $manualModel->surveyCrack,
            'survey_floor_damage' => $manualModel->surveyDamage,
            'survey_wall'         => $manualModel->surveyWall,
            'survey_wall_other'   => $manualModel->surveyOther,
            'survey_wall_morph'   => $manualModel->surveyMorph,
            'survey_wall_crack'   => $manualModel->surveyCrack,
            'survey_wall_damage'  => $manualModel->surveyDamage,
            'survey_house'        => $manualModel->surveyHouse,
            'survey_house_flat'   => $manualModel->surveyHouseFlat,
            'survey_house_other'  => $manualModel->surveyOther,
            'survey_house_morph'  => $manualModel->surveyMorph,
            'survey_house_crack'  => $manualModel->surveyCrack,
            'survey_house_damage' => $manualModel->surveyDamage,
            'survey_stairs'       => $manualModel->surveyStairs,
            'survey_deck'         => $manualModel->surveyDeck,
            'survey_board'        => $manualModel->surveyBoard,
            'survey_door'         => $manualModel->surveyDoor,
            'survey_attach'       => $manualModel->surveyAttach,
            'audit_status'        => $manualModel->audotStatus,
        ];


        /*
        if($this->request->param('del') == 1){
            Cache::rm('manual_data');exit;
        }

        Cache::set('manual_data',$getManual,60*60*24*15);
        */



        return json([
            'code'    => '200',
            'success' => 'success',
            'data'    => [
                'data'          => $data,
                'result'        => $result,
                'manual'        => $manual_id,
                'inspection_id' => $inspection_id
            ]
        ]);
    }





}
