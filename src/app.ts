// 複数のプロジェクトを管理するアプリを作成
/**
 * 1.formを表示しユーザーの入力を受け取る
 * 2.ユーザーの入力を取得してバリデーションチェック
 * 3.新しいリストを作成して画面に表示する
 */

/**
 * autobind decorator
 * デコレーターは３つの引数をうけとる（ターゲット：any、プロパティ名（メソッド名）: string, プロパティでスクリプター: PropertyDescriptor)
 */
function autobind(
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

// formを表示しユーザーの入力を受け取るためのクラス
//projectInput Class
class ProjectImput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  // ２.入力に対したプロパティを追加
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  // テンプレートや表示先の要素を取得するためのコンストラクター
  constructor() {
    // テンプレートエレメントへの参照
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    // テンプレートを表示する親要素への参照..getElementByIdはどのような型を取得するかわからないためasで型キャストしている。
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // 画面表示：テンプレートをimportNodeとして取得
    const importedNode = document.importNode(
      this.templateElement.content,
      true // 下の階層も含めてインポートする
    );
    //フォーム、 テンプレートの最初の子要素_importedNodeから具体的なHTMLの要素を取得する必要があるためプロパティを追加。
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input"; // スタイルをあてるcss

    // 2.入力を取得するための操作
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }
  // イベントリスナーのレシーバー関数
  @autobind // tsconfigでデコレーターの設定をONにしなくてはエラーとなる
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }
  // フォームにイベントリスナーを設定する
  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  /**
   * ホストエレメントに要素を追加するinsertAdjacentElementはデフォルトのメソッド引数のafterbeginは(開始タグの直後)
   *  第二引数にimportedNodeを追加したいがconstractorのconstで DocumentFragment型なので直接アクセスできないimportedNodeから具体的なHTMLの要素を取得する必要がある。
   * */
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}
// インスタンスを作成した時にインスタンスに属するフォームを画面に表示
const prjInput = new ProjectImput();
