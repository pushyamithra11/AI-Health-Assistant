# from fastapi import APIRouter, HTTPException, Depends
# from pydantic import BaseModel, EmailStr
# from passlib.context import CryptContext
# from config import cache, logger # We can use Redis to store sessions later

# router = APIRouter(prefix="/api/auth", tags=["Authentication"])
# pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# # Mock Database (In production, use PostgreSQL/MongoDB)
# users_db = {}

# class UserSignup(BaseModel):
#     username: str
#     email: EmailStr
#     password: str

# class UserLogin(BaseModel):
#     username: str
#     password: str

# @router.post("/signup")
# async def signup(user: UserSignup):
#     if user.username in users_db:
#         raise HTTPException(status_code=400, detail="Username already exists")
    
#     hashed_password = pwd_context.hash(user.password)
#     users_db[user.username] = {
#         "email": user.email,
#         "password": hashed_password
#     }
#     logger.info(f"👤 New User Registered: {user.username}")
#     return {"message": "User created successfully", "username": user.username}

# @router.post("/login")
# async def login(user: UserLogin):
#     db_user = users_db.get(user.username)
#     if not db_user or not pwd_context.verify(user.password, db_user["password"]):
#         raise HTTPException(status_code=401, detail="Invalid username or password")
    
#     return {
#         "message": "Login successful",
#         "user": {
#             "username": user.username,
#             "email": db_user["email"]
#         }
#     }
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from tinydb import TinyDB, Query
from config import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

db = TinyDB('users.json')
UserTable = Query()

class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/signup")
async def signup(user: UserSignup):
    if db.search(UserTable.username == user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = pwd_context.hash(user.password)
    db.insert({
        "username": user.username,
        "email": user.email,
        "password": hashed_password
    })
    
    logger.info(f"👤 New User Registered: {user.username}")
    return {"message": "User created successfully", "username": user.username}

@router.post("/login")
async def login(user: UserLogin):
    result = db.search(UserTable.username == user.username)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    db_user = result[0]
    if not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # This nested structure is standard for professional APIs
    return {
        "message": "Login successful",
        "user": {
            "username": db_user["username"],
            "email": db_user["email"]
        }
    }