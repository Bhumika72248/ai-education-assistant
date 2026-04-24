import os, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from db import get_session
from models.schemas import CourseMaterial
from routers.auth import get_current_user
from models.schemas import User

router = APIRouter()

UPLOADS_PATH = os.getenv("UPLOADS_PATH", "./data/uploads")


@router.post("/upload")
async def upload_material(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can upload materials")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    os.makedirs(UPLOADS_PATH, exist_ok=True)
    safe_name = f"{current_user.id}_{file.filename}"
    file_path = os.path.join(UPLOADS_PATH, safe_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    material = CourseMaterial(
        title=file.filename,
        file_url=f"/materials/file/{safe_name}",
        uploaded_by=current_user.id,
    )
    session.add(material)
    session.commit()
    session.refresh(material)
    print(f"[MATERIAL] Uploaded: {file.filename} by teacher_id={current_user.id}")
    return {"message": "Material uploaded successfully", "material": {
        "id": material.id,
        "title": material.title,
        "file_url": material.file_url,
        "created_at": material.created_at,
    }}


@router.get("")
def list_materials(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    materials = session.exec(select(CourseMaterial).order_by(CourseMaterial.created_at.desc())).all()
    return {"materials": [
        {"id": m.id, "title": m.title, "file_url": m.file_url, "created_at": m.created_at}
        for m in materials
    ]}
