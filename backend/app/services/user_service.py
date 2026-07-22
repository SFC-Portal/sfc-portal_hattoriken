from sqlalchemy.orm import Session

from app.models.user import User


def get_or_create_user(db: Session, jwt_payload: dict) -> User:
    """初回ログイン時にusers行を作成し、以降はGoogleプロフィールの変更を追従させる。
    bio/interests/graduation_year/grade/facultyはユーザーが手動編集する項目なので上書きしない。
    """
    user_id = jwt_payload["sub"]
    metadata = jwt_payload.get("user_metadata") or {}
    email = jwt_payload.get("email", "")
    display_name = metadata.get("full_name") or metadata.get("name") or email
    avatar_url = metadata.get("avatar_url") or metadata.get("picture")

    user = db.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=email, display_name=display_name, avatar_url=avatar_url)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    changed = False
    if email and user.email != email:
        user.email = email
        changed = True
    if display_name and user.display_name != display_name:
        user.display_name = display_name
        changed = True
    if avatar_url and user.avatar_url != avatar_url:
        user.avatar_url = avatar_url
        changed = True

    if changed:
        db.commit()
        db.refresh(user)
    return user
