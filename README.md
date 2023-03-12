# K-AutoMail

훈련병을 위한 자동 인터넷 편지 전송기

---

## 제작 동기

 한국의 남성이라면 누구나 피할 수 없는 군대. 2020년의 어느날, 하나 둘 점점 떠나가는 친구들을 보며, 나에게도 남은 날이 얼마 남지 않았다는 사실을 깨닫게 되었다. 훈련소에 있는 훈련병들에게는 '인터넷 편지' 라는 것을 써줄 수 있는데, 말 그대로 각 군에 맞는 인터넷 페이지로 접속해서 편지를 보내면 훈련병이 받아보는 시스템이다. 여름에 군대를 갔던 친구들에게도 인터넷 편지를 많이 써주었는데, 겨울이 되어 생각해보니 이를 자동화 할 수 있지 않았나 라는 생각이 들기 시작했다. **그래서 직접 만들어 보았다.**



## 기술 스택

 기본적으로 웹으로 접속 가능하며, 프론트엔드는 기본적인 **HTML5**로 구성했고, 백엔드는 Node.js 로 구성하였다. DB는 따로 사용하지 않았으며, Node.js에서 파일 입출력을 통해 .json 파일 형태로 만들어 관리해 주었다. 백엔드 내에서는 크롤링을 위해 **puppeteer**를 사용했으며, 결과를 파싱하기 쿼라 하기위해 **cheerio** 도 사용하였다. 배포는 **Heroku** 를 통해 Heroku 20 버전으로 배포했었다. 

 

## 설명

 사랑하는 사람들에게서의 편지도 훌륭한 에너지가 되지만, 사실 그들이 제일 목말라하는 것은 사회가 어떻게 돌아가고 있는지에 대한 것이다. 그들의 갈증을 해소해 주기 위해서, 기사들을 제공해 준다. 훈련병을 등록하고, 보낼 편지의 기사 종류를 고르면 작동한다. 편지의 내용은 전부 크롤링을 통해 구성되었으며, 다음의 네가지 URL에서 끌어와 크롤링 하였다. 네이버 eSports 탭을 제외하고는 전부 전날 인기순 기사의 제목만 크롤링하여 저장했다.

- 연합뉴스 - https://www.yna.co.kr/
- 네이버 eSports - https://game.naver.com/esports/League_of_Legends/news/lol
- 네이버 야구 - https://sports.news.naver.com/kbaseball/news/index?isphoto=N
- 네이버 해외축구 - https://sports.news.naver.com/wfootball/news/index?isphoto=N

   훈련병을 등록할 때는 이름, 생년월일, 입대일과 입소하는 훈련소의 정보를 입력해야 한다. 단, 입대일은 현재 날짜를 기준으로 30일 이내여야만 등록이 가능하다. 마지막으로 비밀번호를 입력함으로써 훈련병 생성 과정이 완료된다. 저장된 훈련병 정보는 조회/수정/삭제 모두 가능하다. 서버는 24시간에 한번씩, 한국 시간대를 기준으로(Heroku의 서버는 미국에 있다), 저장되어있는 훈련병에 대해 편지 작성 상태 가능 여부 및 수료일을 확인하며, 작성 가능한 훈련병에 대해 편지를 작성해준다. 또한 수료일이 지난 훈련병을 .json 파일에서 지워준다.



## 작동 화면

<details>
    <summary>/</summary>
    처음 접속하면 <strong>등록하기</strong>와 <strong>조회하기</strong> 버튼을 발견할 수 있다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526792-977dfc00-8497-4cc6-85f0-459059d698f8.gif"/>
</details>

<details>
    <summary>/register</summary>
    훈련병을 등록하기 위해 정보를 작성하는 페이지이다. 테스트를 위해 필자를 재입대 새켜보도록 하겠다.
    <img src="https://user-images.githubusercontent.com/57629885/224526952-bd473d39-49f4-4fd7-881d-3c2bf8235c91.gif"/>
    <br>
    입대일자는 현재 일을 기준으로 30일 이내만 가능하다. 즉, 하단과 같이 잘못 입력한다면 경고를 띄어준다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526767-053e5682-4f63-42de-9d95-62e6ca0b7713.gif"/>
    <br>
    이제 편지의 수와 종류를 선택해주자. 남은 편지가 있으면 오류가 발생한다. 리그 오브 레전드를 제외한 나머지 타입의 기사들은 한 개만 보낼 수 있으므로 주의해야 한다(나머지 기사들은 제목들만 크롤링 된다).
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526803-b8d4f32c-7695-4d86-a686-e4690c37bb97.gif"/>
    <br>
     다음은 훈련병이 어디로 입소하는지를 골라주자. 현재는 육군과 공군만 가능하다. 해군은 본인인증과정이 필요하고, 해병대는 한 훈련병이 매일 한 개의 편지만 받을 수 있기 때문에 지원하지 않는다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526805-94c7bf26-da43-4b67-bfcb-2485d090a8af.gif"/>
   <br>
    다시한번 6사단 신병교육대를 가보도록 하겠다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526794-155a619d-be25-48ea-9227-6599d25d6fdb.gif"/>
    <br>
    생각해보니까 이번에는 논산으로 가보고싶다. 재설정을 해보자.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526798-dfda874e-5184-495d-8859-b93926616cff.gif"/>
    <br>
    이제 비밀번호를 설정해보자. 길이 제한이 걸려있고, 다시한번 확인하는 과정도 포함되어있다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526807-ff5f2bfc-caaf-4dc1-b994-70c178811951.gif"/>
    <br>
    모든 정보가 입력되었다. 등록 버튼을 눌러보도록 하자.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526801-48533bfc-25a0-4641-9f86-598ad2b30bba.gif"/>
    <br>
    아뿔사. 아까 입영 날짜를 과거로 돌려놨던 사실을 잊었다. 다시한번 수정하도록 하자.
    <br>
    수정하고 제출버튼을 누르면, 모달창이 하나 뜨면서 모든 등록 과정이 완료된다. 
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526799-192e5cc2-9660-46a1-a942-ec2c4243a036.gif"/>
    <br>
    result 화면으로 이동되었으며, 정상적으로 등록된것을 확인할 수 있다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526769-b5509fdc-192b-47bc-a2ae-86022ccb9adb.gif"/>
    <br>
</details>

<details>
<summary>/search</summary>
	등록은 했는데, 잘 됐는지 불안하다. 
    <br> 
    메인 화면에서 <strong>조회하기</strong> 버튼을 발견할 수 있다.
	<br>
	<img src="https://user-images.githubusercontent.com/57629885/224526775-b0b7c5f4-9e8c-4c48-a66a-630136f956c6.gif"/>
    <br>
    아까 입력했던 훈련병의 정보를 입력해보자.
	<br>
    <img src="https://user-images.githubusercontent.com/57629885/224526774-189afd90-41a2-4bb0-b859-8ed61f75f0a4.gif"/>
    <br>
    검색이 안되는것이 당연하다. 재입대하기는 싫어서 아까 몰래 지웠기 때문이다.
    <br>
    해당 기능은 /edit 부분에서 다시한번 설명하겠다. 
    <br>
    또한, 잘못된 정보의 검색도 막고있다. 다음을 보자.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526771-ce5d1119-0118-40e0-bed1-be9380164c28.gif"/>
    <br>
    <strong>이름</strong> 부분은, 오직 한글인 이름만 입력할 수 있도록 하고있다. 
    <br>
    이전과 동일하게 오류가 난 부분이 있다면 어디서 오류가 있는지 알려준다.
    <br>
    정상 검색이 되는지 확인하기 위해, 1년전에 입대했던 동생의 정보를 입력해보도록 하자.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526776-47f6e3c9-f97e-4c2e-91b0-8ecd92e0a5a4.gif"/>
    <br>
    역시, 아직 전역을 안해서 그런지 잘 남아있다.
    <br>
    <del>사실은 작동 했던 파일이, 1년전에 마지막으로 작동하고 계속 멈춰있었기 떄문이다.</del>
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526779-0c4174c8-43d3-43f9-820c-e7b024305077.gif"/>
    <br>
    이런식으로 정보를 조회한 후 성공적으로 검색 된다면, /result 화면으로 이동하게 된다.
    <br>
    해당 경로에서는 수정 및 삭제를 지원한다.
    <br>
</details>

<details>
    <summary>/result</summary>
    <br>
    아까 입력해놨던 필자 정보를 검색해보도록 하자. 
    <br>
    아직 지워지지 않은 상태이기에 검색이 가능하다.
    <br>
    비밀번호를 입력하면, 수정 및 삭제가 가능하다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526786-5844fad0-0ae4-4dee-9029-082b098a3513.gif">
    <br>
    다음과 같이 수정이 가능하다. 이번에는 기사를 수정해보도록 하겠다.
    <br>
    <img src="https://user-images.githubusercontent.com/57629885/224526782-f87ddbcc-cdc7-413f-8a06-aa3995ee2731.gif"/>
    <br>
    생각해보니 군대는 못갈듯 하니, 역시 재입대는 포기하도록 하겠다.
    <img src="https://user-images.githubusercontent.com/57629885/224526784-f83f2d76-3d8d-4391-9640-97f20cb720f7.gif"/>
</details>

모든 과정은 콘솔에 출력되어 확인이 가능하다.

![logger](https://user-images.githubusercontent.com/57629885/224526789-d68ea686-d77e-492a-93a5-e251d8251112.png)



## 아쉬운점 

 당시에는 AWS 계정을 만들 생각을 하지 않았었기 때문에, 무료로 월 500시간을 제공해주는 Heroku에 배포했었다. 하지만 최근에 다시 접속해보니 무료 요금제가 사라지고, 잘 작동하던 다른 서비스들도 버전 이슈로 Deprecated 되었다. 다음에 프로젝트를 해서 서버가 필요한 상황이 된다면, AWS를 선택할 것 같다.

 또한 DB를 사용하지 않은 것도 아쉬운 점이다. 물론 지금 당장은 많은 사람들이 사용하진 않았지만, 그래도 서비스의 확장성을 위해서는 DB를 사용하는 것이 맞았다고 본다. 그리고 웹 크롤링을 할 때, 같은 내용을 다른 훈련병의 메일을 작성할 때 매번 크롤링 하던 비효율적인 행동도 있었는데, 다시 만들게 된다면 중복되는 URL을 가져오게 된다면 이전의 크롤링 한 내용을 리턴하는 방식으로 구성하고싶다.  보안 관련해서도 비밀번호를 평문으로 저장하는, 용서받지 못할 행위를 했다. 

## 마무리

 아쉬운 점들이 있긴 했지만, 처음으로 다른 사람도 사용할 수 있는 서비스를 만들었다는 점에서 의의가 있었다. 덕분에 10명정도의 친구들은 훈련소생활을 심심하게 보내지 않을 수 있었다. 나 때문인지는 모르겠지만, 어느시점부터 공군 인터넷 편지의 방식이 살짝 변경되었던 적이 있지만, 그떄는 입대 전이어서 바로 수정해서 대응했던 적이 있었다. 친구들이 얼마 없는 전화 시간에 전화 한번씩 해주니까 그것만큼 뿌듯했던 적이 없었다. 

![letters1](https://user-images.githubusercontent.com/57629885/224530779-40c0dddc-05a7-4ada-b024-0112fc77b246.png)

 이 서비스를 완성시키기 위해 **입대 전날** 까지도 코드를 붙잡고있었다. 입대가 2021년 2월 15일이었는데, 정말 직전까지 붙잡고있었다. 그만큼 애정이 있었던 프로젝트기도 했지만, 사실은 내 입대 이후에도 작동하기를 바랐던 것도 있었다. 안타깝게도, 분명 1주일동안은 잘 작동하는 것을 확인했는데, 내 앞으로 오는 내가 쓴 인편은 하나도 없었다. 결국 '남 좋은 일' 을 한 셈이 되었다. 그래도 내 프로젝트로 도움을 받은 사람들이 분명 있기도 했고, 나도 아주 좋은 경험이 되었기 때문에 웃으면서 받아들일 수 있었다. 

![deployed](https://user-images.githubusercontent.com/57629885/224530841-eca96206-ff35-4a27-85ac-1790431c36ee.png)
