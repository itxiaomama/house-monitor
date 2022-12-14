<?php
namespace app\admin\model;

use think\Model;

class Manual extends Model{

    protected $name = 'manual';

    public $change = [0=>'无变更',1=>'其他'];

    public $buildChange = [0=>'无拆改',1=>'一般拆改',2=>'严重拆改'];

    public $buildPlace  = [0=>'平地',1=>'山坡',2=>'河边',3=>'低洼地带',4=>'其他'];

    public $buildEnv    = [0=>'无异常',1=>'振动',2=>'降水',3=>'土体扰动',4=>'其他'];

    public $buildHisDisaster = [0=>'正常使用',1=>'火灾',2=>'风灾',3=>'雪灾',4=>'水灾',5=>'地质',6=>'其他'];

    public $buildRepair  = [0=>'正常使用',1=>'质量原因',2=>'灾害原因',3=>'使用功能原因',4=>'其他原因'];

    public $buildStructure  = [0=>'框架结构',1=>'砖混结构',2=>'钢结构',3=>'砖木结构',4=>'木结构',5=>'混合结构',6=>'其他'];

    public $buildIdentify  = [
        0 =>[
            'name' => '未鉴定',
        ],
        1 =>[
            'name'   => '已鉴定',
            'chrild' => [
                '1-1'  => 'A级',
                '1-2'  => 'B级',
                '1-3'  => 'C级',
                '1-4'  => 'D级'
            ]

        ],

    ];

    public $surveyGround = [
        0 =>[
            'name'   => '散水',
            'chrild' => [
                '0-1'  => '无异常',
                '0-2'  => '局部裂缝',
                '0-3'  => '多处裂缝',
            ]
        ],
        1=>[
            'name'   => '台阶',
            'chrild' => [
                '1-1'  => '无异常',
                '1-2'  => '局部裂缝',
                '1-3'  => '多处裂缝',
            ]
        ]
    ];

    public $surveyFloor  = [0=>'混凝土',1=>'砖',2=>'木',3=>'钢',4=>'混合',5=>'现浇楼板',6=>'预制楼板',7=>'木楼板'];

    public $surveyOther  = [0=>'无法入户，不可见',1=>'工作正常，无异常'];

    public $surveyMorph  = [0=>'局部',1=>'整体倾斜',2=>'严重',3=>'其他'];

    public $surveyCrack  = [0=>'端部',1=>'中间',2=>'斜',3=>'水平',4=>'宽',5=>'细小',6=>'其他'];

    public $surveyDamage = [
        0 => ['name' =>'锈蚀'],
        1 => ['name' =>'风化'],
        2 => ['name' =>'腐朽'],
        3 => ['name' =>'酥松'],
        4 =>[
            'name'   => '粉刷脱落',
            'chrild' => [
                '4-1'  => '局部',
                '4-2'  => '大面积',
            ]
        ],
        5 =>[
            'name'   => '渗水',
            'chrild' => [
                '5-1'  => '轻微',
                '5-2'  => '霉变',
                '5-3'  => '长苔',
            ]
        ],
        6 => ['name' =>'其他']
    ];

    public $surveyWall   = [0=>'混凝土',1=>'砖',2=>'木',3=>'钢'];

    public $surveyHouse  = [0=>'现浇屋面',1=>'预制板',2=>'预制屋架瓦屋面',3=>'木屋架瓦屋面',4=>'钢屋架'];

    public $surveyHouseFlat  = [0=>'平',1=>'坡'];

    public $surveyStairs  = [0=>'无法入户，不可见',1=>'无异常',2=>'楼梯踏步破损',3=>'扶手老旧破损'];

    public $surveyDeck    = [
        0 => ['name'=>'无法入户，不可见'],
        1 => ['name'=>'无异常'],
        2 => [
            'name'   => '悬挑梁',
            'chrild' => [
                '2-1'  => '有',
                '2-2'  => '无',
            ]
        ],
        3 => ['name'=>'明显变形'],
        4 =>[
            'name'   => '裂缝',
            'chrild' => [
                '4-1'  => '轻微',
                '4-2'  => '一般',
                '4-3'  => '严重',
            ]

        ],
        5 =>[
            'name'   => '渗漏',
            'chrild' => [
                '5-1'  => '轻微',
                '5-2'  => '一般',
                '5-3'  => '严重',
            ]

        ],
        6 =>[
            'name'   => '老化破损',
            'chrild' => [
                '6-1'  => '轻微',
                '6-2'  => '一般',
                '6-3'  => '严重',
            ]
        ],
    ];

    public $surveyBoard   = [
        0 => ['name'=>'无异常'],
        1 => ['name'=>'明显变形'],
        2 =>[
            'name'   => '老化破损',
            'chrild' => [
                '2-1'  => '轻微',
                '2-2'  => '一般',
                '2-3'  => '严重',
            ]
        ],
    ];

    public $surveyDoor    = [
        0 => ['name'=>'无法入户，不可见'],
        1 => ['name'=>'无异常'],
        2 => ['name'=>'明显变形'],
        3 => [
            'name'   => '老化破损',
            'chrild' => [
                '3-1'  => '轻微',
                '3-2'  => '一般',
                '3-3'  => '严重',
            ]
        ],
        4 =>[
            'name'   => '缺损',
            'chrild' => [
                '4-1'  => '个别',
                '4-2'  => '多处',
            ]
        ],
    ];

    public $surveyAttach   = [
        0 => ['name'=>'无异常'],
        1 => ['name'=>'明显变形'],
        2 => [
            'name'   => '老化破损',
            'chrild' => [
                '2-1'  => '轻微',
                '2-2'  => '一般',
                '2-3'  => '严重',
            ]
        ],
    ];

    public $audotStatus   = [0=>'未审核',1=>'审核通过',2=>'驳回'];

}